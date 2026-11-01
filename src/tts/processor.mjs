import { log as defaultLog } from '@eliware/common';
import { playText as defaultPlayText } from '../audio/default-playback.mjs';
import { ensureGuildState } from './state.mjs';
import { logPlaybackFailure } from './playback-failure.mjs';

export function createQueueProcessor({ getGuildState = ensureGuildState, playText = defaultPlayText, log = defaultLog } = {}) {
  return async function processQueue(guildId) {
    const state = getGuildState(guildId);
    if (state.playing) return;
    while (state.queue.length > 0) {
      const job = state.queue.shift();
      log.debug('TTS queue processing', {
        guildId, remaining: state.queue.length, userId: job.userId,
        queueWaitMs: job.receivedAt == null ? undefined : Math.round(performance.now() - job.receivedAt),
      });
      state.playing = true;
      try { await playText(guildId, job.text, job.userId, job.userTag, job.receivedAt, state); }
      catch (error) { logPlaybackFailure(error, log); }
      finally { state.playing = false; }
    }
  };
}

export const processQueue = createQueueProcessor();
