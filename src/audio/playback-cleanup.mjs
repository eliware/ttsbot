import { cleanupCurrent } from "../audioLifecycle.mjs";

export function cleanupPlayback({ state, current, responseBody }) {
  cleanupCurrent(current, { responseBody, abort: false });
  if (state.current === current) state.current = null;
}
