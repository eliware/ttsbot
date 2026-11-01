import { createJitterBuffer } from '../jitterBuffer.mjs';
import { createAudioResource, AudioPlayerStatus, StreamType, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import { Resampler } from '@eliware/resampler';
import { createAudioPipeline } from './audio-pipeline.mjs';
import { preparePlaybackInput } from './input.mjs';
import { validateSpeechResponse } from './response.mjs';
import { createOpenAIClient } from './client.mjs';
import { isRetryableOpenAIError, openAIRetryDelay } from '../ttsPolicies.mjs';
import { requestSpeech } from './openai-request.mjs';
import { waitForPlayback } from './playback-events.mjs';
import { log } from '@eliware/common';

const sleep = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs));

export function createPlayback({
  createClient,
  createBuffer = createJitterBuffer,
  createResource = createAudioResource,
  AudioStatus = AudioPlayerStatus,
  streamType = StreamType,
  waitForState = entersState,
  connectionStatus = VoiceConnectionStatus,
  ResamplerClass = Resampler,
  getUserSettings,
  replaceText,
  isRetryable = isRetryableOpenAIError,
  retryDelay = openAIRetryDelay,
  log: logger = log,
  now = () => performance.now(),
  delay = sleep,
} = {}) {
  const buildPipeline = createAudioPipeline({ createBuffer, createResource, streamType, ResamplerClass, log: logger });
  const getOpenAIClient = createOpenAIClient({ createClient });

  return async function playText(guildId, text, userId, _userTag, receivedAt, state) {
    const input = await preparePlaybackInput({
      text, state, guildId, userId, waitForState, connectionStatus, getUserSettings, replaceText, log: logger,
    });
    if (!input) return;
    const { inputText, voice } = input;

    const controller = new AbortController();
    const current = { controller };
    state.current = current;
    const metrics = { receivedAt, requestStartedAt: now() };
    logger.debug('OpenAI TTS request', { guildId, userId, voice, inputLength: inputText.length, model: 'tts-1', responseFormat: 'pcm' });
    const result = await requestSpeech({
      client: getOpenAIClient(), input: inputText, voice, signal: controller.signal, guildId, userId,
      log: logger, isRetryableOpenAIError: isRetryable, openAIRetryDelay: retryDelay, sleep: delay,
    });
    const audio = validateSpeechResponse({ result, signal: controller.signal, receivedAt, metrics, now, guildId, userId, log: logger });
    if (!audio) return;
    const { response, source } = audio;

    const { resampler, jitterBuffer, resource } = buildPipeline(source);
    const player = state.player;
    Object.assign(current, { player, resource, source, resampler, jitterBuffer });
    return waitForPlayback({
      source, response, resampler, jitterBuffer, resource, player, state, current, metrics,
      receivedAt, guildId, userId, AudioStatus, log: logger, now,
    });
  };
}

export const playText = createPlayback();
