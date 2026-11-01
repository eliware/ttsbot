import { log as defaultLog } from '@eliware/common';
import { playText as defaultPlayText } from '../audio/playback.mjs';
import { ensureGuildState } from './state.mjs';

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
      catch (error) { log.error('Error playing TTS:', error); }
      finally { state.playing = false; }
    }
  };
}

export const processQueue = createQueueProcessor();
