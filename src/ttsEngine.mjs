import fetch from 'node-fetch';
import { createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior, StreamType, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import { Resampler } from '@eliware/resampler';
import { loadUserSettings } from './settings.mjs';
import fs from 'fs/promises';
import path from 'path';
import { Transform } from 'stream';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPLACEMENTS_PATH = path.join(__dirname, '..', 'replacements.json');
let replacementsCache = null;

class PcmFrameAligner extends Transform {
  constructor(frameBytes) {
    super();
    this.frameBytes = frameBytes;
    this.pending = Buffer.alloc(0);
  }

  _transform(chunk, encoding, callback) {
    const input = this.pending.length ? Buffer.concat([this.pending, chunk]) : chunk;
    const alignedLength = input.length - (input.length % this.frameBytes);
    if (alignedLength > 0) this.push(input.subarray(0, alignedLength));
    this.pending = input.subarray(alignedLength);
    callback();
  }

  _flush(callback) {
    this.pending = Buffer.alloc(0);
    callback();
  }
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
  } catch (e) {
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
    console.error(`Discord audio player error for guild ${guildId}:`, err);
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
  if (!state.playing) {
    processQueue(guildId).catch(console.error);
  }
}

async function processQueue(guildId) {
  const state = ensureGuildState(guildId);
  if (state.playing) return;
  while (state.queue.length > 0) {
    const job = state.queue.shift();
    state.playing = true;
    try {
      await playText(guildId, job.text, job.userId, job.userTag);
    } catch (e) {
      console.error('Error playing TTS:', e);
    }
    state.playing = false;
  }
}

// Play text using streamed OpenAI PCM through a native resampler for minimal latency.
export async function playText(guildId, text, userId, userTag) {
  if (!text || text.length > 2000) return;
  const state = ensureGuildState(guildId);
  if (!state.connection) {
    console.warn('No voice connection for guild', guildId);
    return;
  }
  try {
    await entersState(state.connection, VoiceConnectionStatus.Ready, 10_000);
  } catch (e) {
    console.warn('Voice connection was not ready for guild', guildId);
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
    console.error('Replacements error', e);
  }

  // Request PCM for fastest streaming
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  let res;
  try {
    res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        input: inputText,
        voice,
        instructions,
        response_format: 'pcm',
        stream_format: 'audio'
      }),
    });
  } catch (e) {
    console.error('OpenAI TTS request error', e);
    return;
  }

  if (!res.ok || !res.body) {
    let txt = '';
    try { txt = await res.text(); } catch (e) { txt = String(e); }
    console.error('OpenAI TTS request failed', txt);
    return;
  }

  const aligner = new PcmFrameAligner(2);
  const resampler = new Resampler({ inRate: 24000, outRate: 48000, inChannels: 1, outChannels: 2 });
  res.body.on('error', (err) => console.error('OpenAI TTS stream error', err));
  aligner.on('error', (err) => console.error('PCM frame aligner error', err));
  resampler.on('error', (err) => console.error('PCM resampler error', err));

  const pcmStream = res.body.pipe(aligner).pipe(resampler);
  const resource = createAudioResource(pcmStream, { inputType: StreamType.Raw });

  const player = state.player;
  state.current = { player, resource, source: res.body, aligner, resampler };

  const cleanup = () => {
    try { res.body.destroy(); } catch (e) {}
    try { aligner.destroy(); } catch (e) {}
    try { resampler.destroy(); } catch (e) {}
    state.current = null;
  };

  return new Promise((resolve) => {
    const onIdle = () => {
      player.removeListener(AudioPlayerStatus.Idle, onIdle);
      player.removeListener(AudioPlayerStatus.Playing, onPlaying);
      cleanup();
      resolve();
    };
    const onPlaying = () => {
      // no-op
    };
    player.on(AudioPlayerStatus.Idle, onIdle);
    player.on(AudioPlayerStatus.Playing, onPlaying);
    player.play(resource);
    if (state.connection) state.connection.subscribe(player);
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
  try { state.current.source?.destroy?.(); } catch (e) {}
  try { state.current.aligner?.destroy?.(); } catch (e) {}
  try { state.current.resampler?.destroy?.(); } catch (e) {}
  state.current = null;
}
