import { cancelCurrent } from './cancellation.mjs';
import { log as defaultLog } from '@eliware/common';
import { ensureGuildState } from './state.mjs';

export function createSkipAction({ getGuildState = ensureGuildState, log = defaultLog } = {}) {
  return async function skipCurrent(guildId) {
    const state = getGuildState(guildId);
    log.debug('Skipping current TTS', { guildId, queueLength: state.queue.length, hasCurrent: Boolean(state.current), playerStatus: state.player.state.status });
    if (state.player) state.player.stop(true);
    cancelCurrent(state);
  };
}

export const skipCurrent = createSkipAction();
