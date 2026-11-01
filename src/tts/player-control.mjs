import { cancelCurrent } from './cancellation.mjs';

export function stopGuildPlayer(state) {
  if (state.player) state.player.stop(true);
  cancelCurrent(state);
}
