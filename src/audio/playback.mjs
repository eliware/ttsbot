import { Readable } from 'node:stream';
import { createJitterBuffer } from '../jitterBuffer.mjs';
import { createOpenAI } from '@eliware/openai';
import { createAudioResource, AudioPlayerStatus, StreamType, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import { Resampler } from '@eliware/resampler';
import { loadUserSettings } from '../settings.mjs';
import { isRetryableOpenAIError, openAIRetryDelay } from '../ttsPolicies.mjs';
import { requestSpeech } from './openai-request.mjs';
import { waitForPlayback } from './playback-events.mjs';
import { replaceText } from '../text/replacements.mjs';
import { log } from '@eliware/common';

const sleep = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs));

export function toNodeReadable(body) {
  if (body && typeof body.getReader === 'function') return Readable.fromWeb(body);
  return body;
}

export function createPlayback({
  createClient = createOpenAI,
  createBuffer = createJitterBuffer,
  createResource = createAudioResource,
  AudioStatus = AudioPlayerStatus,
  streamType = StreamType,
  waitForState = entersState,
  connectionStatus = VoiceConnectionStatus,
  ResamplerClass = Resampler,
  getUserSettings = loadUserSettings,
  replaceText: replace = replaceText,
  isRetryable = isRetryableOpenAIError,
  retryDelay = openAIRetryDelay,
  log: logger = log,
  now = () => performance.now(),
  delay = sleep,
} = {}) {
  let openaiClient;
  const getOpenAIClient = () => {
    if (!openaiClient) openaiClient = createClient({ apiKey: process.env.OPENAI_API_KEY });
    return openaiClient;
  };

  return async function playText(guildId, text, userId, _userTag, receivedAt, state) {
    if (!text || text.length > 2000) return;
    if (!state.connection) {
      logger.warn('No voice connection for guild', guildId);
      return;
    }
    try {
      await waitForState(state.connection, connectionStatus.Ready, 10_000);
    } catch {
      logger.warn('Voice connection was not ready for guild', guildId);
      return;
    }
    const settings = await getUserSettings(guildId, userId);
    const voice = settings.voice || 'coral';
    let inputText = String(text);
    try {
      inputText = await replace(inputText);
    } catch (error) {
      logger.error('Replacements error', error);
    }

    const controller = new AbortController();
    const current = { controller };
    state.current = current;
    const metrics = { receivedAt, requestStartedAt: now() };
    logger.debug('OpenAI TTS request', { guildId, userId, voice, inputLength: inputText.length, model: 'tts-1', responseFormat: 'pcm' });
    const result = await requestSpeech({
      client: getOpenAIClient(), input: inputText, voice, signal: controller.signal, guildId, userId,
      log: logger, isRetryableOpenAIError: isRetryable, openAIRetryDelay: retryDelay, sleep: delay,
    });
    if (result.aborted || result.failed) return;
    const response = result.response;
    metrics.responseReceivedAt = now();
    logger.debug('OpenAI TTS response received', {
      guildId, userId, hasBody: Boolean(response?.body),
      requestMs: Math.round(metrics.responseReceivedAt - metrics.requestStartedAt),
      discordToOpenAIResponseMs: receivedAt == null ? undefined : Math.round(metrics.responseReceivedAt - receivedAt),
    });
    if (controller.signal.aborted) {
      logger.debug('Discarding canceled OpenAI TTS response', { guildId, userId });
      try { response.body?.cancel?.(); } catch {}
      return;
    }
    if (!response?.body) {
      logger.error('OpenAI TTS response did not include an audio body');
      return;
    }
    const source = toNodeReadable(response.body);
    if (!source || typeof source.pipe !== 'function') {
      logger.error('OpenAI TTS response body is not streamable');
      return;
    }

    const resampler = new ResamplerClass({ inRate: 24000, outRate: 48000, inChannels: 1, outChannels: 2, filterWindow: 8, volume: 1 });
    source.on('error', (error) => logger.error('OpenAI TTS stream error', error));
    resampler.on('error', (error) => logger.error('PCM resampler error', error));
    const jitterBuffer = createBuffer();
    const pcmStream = source.pipe(resampler).pipe(jitterBuffer);
    const resource = createResource(pcmStream, { inputType: streamType.Raw });
    const player = state.player;
    Object.assign(current, { player, resource, source, resampler, jitterBuffer });
    return waitForPlayback({
      source, response, resampler, jitterBuffer, resource, player, state, current, metrics,
      receivedAt, guildId, userId, AudioStatus, log: logger, now,
    });
  };
}

export const playText = createPlayback();
