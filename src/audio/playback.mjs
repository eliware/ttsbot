import { createJitterBuffer } from '../jitterBuffer.mjs';
import { createAudioResource, AudioPlayerStatus, StreamType, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import { Resampler } from '@eliware/resampler';
import { createPlaybackDependencies } from './playback-factory.mjs';
import { preparePlaybackInput } from './input.mjs';
import { executeSpeechRequest } from './request-lifecycle.mjs';
import { sleep } from './delay.mjs';
import { isRetryableOpenAIError, openAIRetryDelay } from '../ttsPolicies.mjs';
import { waitForPlayback } from './playback-events.mjs';
import { log } from '@eliware/common';

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
  const { buildPipeline, getOpenAIClient } = createPlaybackDependencies({
    createClient, createBuffer, createResource, streamType, ResamplerClass, log: logger,
  });

  return async function playText(guildId, text, userId, _userTag, receivedAt, state) {
    const input = await preparePlaybackInput({
      text, state, guildId, userId, waitForState, connectionStatus, getUserSettings, replaceText, log: logger,
    });
    if (!input) return;
    const { inputText, voice } = input;

    const request = await executeSpeechRequest({
      state, client: getOpenAIClient(), inputText, voice, receivedAt, guildId, userId, log: logger, now,
      isRetryable, retryDelay, sleep: delay,
    });
    if (!request) return;
    const { audio: { response, source }, current, metrics } = request;

    const { resampler, jitterBuffer, resource } = buildPipeline(source);
    const player = state.player;
    Object.assign(current, { player, resource, source, resampler, jitterBuffer });
    return waitForPlayback({
      source, response, resampler, jitterBuffer, resource, player, state, current, metrics,
      receivedAt, guildId, userId, AudioStatus, log: logger, now,
    });
  };
}

