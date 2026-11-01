import { cancelCurrent } from './cancellation.mjs';
import { log } from '@eliware/common';
import { ensureGuildState } from './state.mjs';

export function createQueueActions({ getGuildState = ensureGuildState, log: logger = log } = {}) {
  async function skipCurrent(guildId) {
    const state = getGuildState(guildId);
    logger.debug('Skipping current TTS', { guildId, queueLength: state.queue.length, hasCurrent: Boolean(state.current), playerStatus: state.player.state.status });
    if (state.player) state.player.stop(true);
    cancelCurrent(state);
  }

  async function stopAndClear(guildId) {
    const state = getGuildState(guildId);
    logger.debug('Stopping and clearing TTS', { guildId, queueLength: state.queue.length, hasCurrent: Boolean(state.current), playerStatus: state.player.state.status });
    state.queue = [];
    if (state.player) state.player.stop(true);
    cancelCurrent(state);
  }
  return { skipCurrent, stopAndClear };
}

export const { skipCurrent, stopAndClear } = createQueueActions();
