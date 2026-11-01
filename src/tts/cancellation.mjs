import { cleanupCurrent } from '../audioLifecycle.mjs';

export function cancelCurrent(state) {
  if (!state.current) return;
  cleanupCurrent(state.current);
  state.current = null;
}
