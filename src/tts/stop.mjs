import { log as defaultLog } from "@eliware/common";
import { ensureGuildState } from "./state.mjs";
import { stopGuildPlayer } from "./player-control.mjs";

export function createStopAction({ getGuildState = ensureGuildState, log = defaultLog } = {}) {
  return async function stopAndClear(guildId) {
    const state = getGuildState(guildId);
    log.debug("Stopping and clearing TTS", {
      guildId,
      queueLength: state.queue.length,
      hasCurrent: Boolean(state.current),
      playerStatus: state.player.state.status,
    });
    state.queue = [];
    stopGuildPlayer(state);
  };
}

export const stopAndClear = createStopAction();
