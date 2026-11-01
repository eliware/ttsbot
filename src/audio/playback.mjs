import { createPlaybackDependencies } from './playback-factory.mjs';
import { preparePlaybackInput } from './input.mjs';
import { executeSpeechRequest } from './request-lifecycle.mjs';
import { waitForPlayback } from './playback-events.mjs';

export function createPlayback(options = {}) {
  const { buildPipeline, getOpenAIClient, AudioStatus, waitForState, connectionStatus,
    getUserSettings, replaceText, isRetryable, retryDelay, log: logger, now, delay } = createPlaybackDependencies(options);

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

