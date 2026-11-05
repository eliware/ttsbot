import { log as defaultLog } from "@eliware/common";
import { playText as defaultPlayText } from "../audio/default-playback.mjs";
import { ensureGuildState } from "./state.mjs";
import { logPlaybackFailure } from "./playback-failure.mjs";

export function createQueueProcessor({
  getGuildState = ensureGuildState,
  playText = defaultPlayText,
  log = defaultLog,
} = {}) {
  return function processQueue(guildId) {
    const state = getGuildState(guildId);
    if (state.processing) return state.processing;
    if (state.playing) return Promise.resolve();
    const generation = state.queueGeneration ?? 0;
    const process = async () => {
      while (
        state.queue.length > 0 &&
        !state.stopping &&
        (state.queueGeneration ?? 0) === generation
      ) {
        const job = state.queue.shift();
        log.debug("TTS queue processing", {
          guildId,
          remaining: state.queue.length,
          userId: job.userId,
          queueWaitMs:
            job.receivedAt == null ? undefined : Math.round(performance.now() - job.receivedAt),
        });
        state.playing = true;
        try {
          await playText(guildId, job.text, job.userId, job.userTag, job.receivedAt, state);
        } catch (error) {
          logPlaybackFailure(error, log);
        } finally {
          state.playing = false;
        }
      }
    };
    const processing = process();
    const tracked = processing.finally(() => {
      state.processing = null;
      if (!state.stopping && state.queue.length > 0) {
        processQueue(guildId).catch((error) => log.error("Queue processing error", error));
      }
    });
    state.processing = tracked;
    return tracked;
  };
}

export const processQueue = createQueueProcessor();
