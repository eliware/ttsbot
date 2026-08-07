import { Readable } from 'node:stream';
import { createOpenAI } from '@eliware/openai';
import { createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior, StreamType, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import { Resampler } from '@eliware/resampler';
import { loadUserSettings } from './settings.mjs';
import fs from 'fs/promises';
import { log, path } from '@eliware/common';

const REPLACEMENTS_PATH = path(import.meta, '..', 'replacements.json');
let replacementsCache = null;
let openaiClient = null;

function getOpenAIClient() {
  if (!openaiClient) openaiClient = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

function toNodeReadable(body) {
  if (body && typeof body.getReader === 'function') return Readable.fromWeb(body);
  return body;
}

async function loadReplacements() {
  if (replacementsCache) return replacementsCache;
  try {
    const raw = await fs.readFile(REPLACEMENTS_PATH, 'utf8');
    const arr = JSON.parse(raw || '[]');
    // build regex list for whole-word, case-insensitive replacements
    replacementsCache = arr.map(({ search, replace }) => {
      const esc = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp('\\b' + esc + '\\b', 'gi');
      return { search, replace, regex };
    });
    return replacementsCache;
  } catch {
    replacementsCache = [];
    return replacementsCache;
  }
}

// In-memory guild states
const guildStates = new Map();

function createGuildAudioPlayer(guildId) {
  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
      maxMissedFrames: 100,
    },
  });
  player.on('error', (err) => {
    log.error(`Discord audio player error for guild ${guildId}:`, err);
  });
  return player;
}

export function ensureGuildState(guildId) {
  if (!guildStates.has(guildId)) {
    guildStates.set(guildId, {
      connection: null,
      player: createGuildAudioPlayer(guildId),
      queue: [],
      playing: false,
      linkedTextChannelId: null,
      current: null,
    });
  }
  return guildStates.get(guildId);
}

// FIFO queue handling
export async function enqueueSpeech(guildId, item) {
  const state = ensureGuildState(guildId);
  state.queue.push(item);
  log.debug('TTS queue updated', { guildId, queueLength: state.queue.length, userId: item.userId, textLength: item.text?.length });
  if (!state.playing) {
    processQueue(guildId).catch((error) => log.error('Queue processing error', error));
  }
}

async function processQueue(guildId) {
  const state = ensureGuildState(guildId);
  if (state.playing) return;
  while (state.queue.length > 0) {
    const job = state.queue.shift();
    log.debug('TTS queue processing', { guildId, remaining: state.queue.length, userId: job.userId, queueWaitMs: job.receivedAt == null ? undefined : Math.round(performance.now() - job.receivedAt) });
    state.playing = true;
    try {
      await playText(guildId, job.text, job.userId, job.userTag, job.receivedAt);
    } catch (e) {
      log.error('Error playing TTS:', e);
    }
    state.playing = false;
  }
}

// Play text using streamed OpenAI PCM through a native resampler for minimal latency.
export async function playText(guildId, text, userId, _userTag, receivedAt) {
  if (!text || text.length > 2000) return;
  const state = ensureGuildState(guildId);
  if (!state.connection) {
    log.warn('No voice connection for guild', guildId);
    return;
  }
  try {
    await entersState(state.connection, VoiceConnectionStatus.Ready, 10_000);
  } catch {
    log.warn('Voice connection was not ready for guild', guildId);
    return;
  }
  const settings = await loadUserSettings(guildId, userId);
  const instructions = settings.instructions || '';
  const voice = settings.voice || 'coral';

  // Apply user-defined replacements (loaded from ../replacements.json) before sending to the TTS API
  let inputText = String(text);
  try {
    const reps = await loadReplacements();
    for (const r of reps) {
      inputText = inputText.replace(r.regex, r.replace);
    }
  } catch (e) {
    log.error('Replacements error', e);
  }

  // Request PCM for fastest streaming through the shared OpenAI client.
  let res;
  const metrics = { receivedAt, requestStartedAt: performance.now() };
  log.debug('OpenAI TTS request', { guildId, userId, voice, inputLength: inputText.length, model: 'tts-1', responseFormat: 'pcm' });
  try {
    res = await getOpenAIClient().audio.speech.create({
      model: 'tts-1',
      input: inputText,
      voice,
      instructions,
      response_format: 'pcm',
      stream_format: 'audio',
    });
  } catch (e) {
    log.error('OpenAI TTS request error', e);
    return;
  }

  metrics.responseReceivedAt = performance.now();
  log.debug('OpenAI TTS response received', { guildId, userId, hasBody: Boolean(res?.body), requestMs: Math.round(metrics.responseReceivedAt - metrics.requestStartedAt), discordToOpenAIResponseMs: receivedAt == null ? undefined : Math.round(metrics.responseReceivedAt - receivedAt) });
  if (!res?.body) {
    log.error('OpenAI TTS response did not include an audio body');
    return;
  }

  const source = toNodeReadable(res.body);
  if (!source || typeof source.pipe !== 'function') {
    log.error('OpenAI TTS response body is not streamable');
    return;
  }

  const resampler = new Resampler({
    inRate: 24000,
    outRate: 48000,
    inChannels: 1,
    outChannels: 2,
    filterWindow: 8,
    volume: 1,
  });
  source.on('error', (err) => log.error('OpenAI TTS stream error', err));
  resampler.on('error', (err) => log.error('PCM resampler error', err));

  let audioBytes = 0;
  source.on('data', (chunk) => {
    if (metrics.openaiFirstByteAt == null) {
      metrics.openaiFirstByteAt = performance.now();
      log.debug('OpenAI TTS first audio byte', { guildId, userId, firstByteMs: Math.round(metrics.openaiFirstByteAt - metrics.requestStartedAt), discordToFirstOpenAIMs: receivedAt == null ? undefined : Math.round(metrics.openaiFirstByteAt - receivedAt) });
    }
    audioBytes += chunk.length;
  });
  source.on('end', () => {
    metrics.openaiLastByteAt = performance.now();
    log.debug('OpenAI TTS stream ended', { guildId, userId, audioBytes, openaiStreamMs: Math.round(metrics.openaiLastByteAt - metrics.openaiFirstByteAt), requestToLastOpenAIMs: Math.round(metrics.openaiLastByteAt - metrics.requestStartedAt) });
  });
  resampler.on('data', () => {
    if (metrics.resamplerFirstByteAt == null) {
      metrics.resamplerFirstByteAt = performance.now();
      log.debug('Discord audio first PCM byte ready', { guildId, userId, resamplerMs: Math.round(metrics.resamplerFirstByteAt - metrics.requestStartedAt) });
    }
  });
  resampler.on('end', () => {
    metrics.resamplerLastByteAt = performance.now();
    log.debug('Discord audio last PCM byte ready', { guildId, userId, resampledAudioMs: Math.round(metrics.resamplerLastByteAt - metrics.resamplerFirstByteAt) });
  });
  const pcmStream = source.pipe(resampler);
  const resource = createAudioResource(pcmStream, { inputType: StreamType.Raw });

  const player = state.player;
  state.current = { player, resource, source, resampler };

  const cleanup = () => {
    try { res.body.destroy(); } catch {}
    try { resampler.destroy(); } catch {}
    state.current = null;
  };

  return new Promise((resolve) => {
    const onIdle = () => {
      player.removeListener(AudioPlayerStatus.Idle, onIdle);
      player.removeListener(AudioPlayerStatus.Playing, onPlaying);
      metrics.playbackIdleAt = performance.now();
      log.debug('Discord TTS playback idle', { guildId, userId, audioBytes, playbackTotalMs: Math.round(metrics.playbackIdleAt - metrics.requestStartedAt), openaiToPlaybackIdleMs: metrics.openaiFirstByteAt == null ? undefined : Math.round(metrics.playbackIdleAt - metrics.openaiFirstByteAt) });
      cleanup();
      resolve();
    };
    const onPlaying = () => {
      if (metrics.playbackFirstByteAt != null) return;
      metrics.playbackFirstByteAt = performance.now();
      log.debug('Discord audio playback started', { guildId, userId, playbackStartMs: Math.round(metrics.playbackFirstByteAt - metrics.requestStartedAt), discordToPlaybackMs: receivedAt == null ? undefined : Math.round(metrics.playbackFirstByteAt - receivedAt) });
    };
    player.on(AudioPlayerStatus.Idle, onIdle);
    player.on(AudioPlayerStatus.Playing, onPlaying);
    // Subscribe before starting the resource so initial PCM frames are not
    // produced while the voice connection has no subscriber.
    if (state.connection) state.connection.subscribe(player);
    player.play(resource);
  });
}

export async function skipCurrent(guildId) {
  const state = ensureGuildState(guildId);
  if (state.player) state.player.stop(true);
  cleanupCurrent(state);
}

export async function stopAndClear(guildId) {
  const state = ensureGuildState(guildId);
  state.queue = [];
  if (state.player) state.player.stop(true);
  cleanupCurrent(state);
}

function cleanupCurrent(state) {
  if (!state.current) return;
  try { state.current.source?.destroy?.(); } catch {}
  try { state.current.resampler?.destroy?.(); } catch {}
  state.current = null;
}
