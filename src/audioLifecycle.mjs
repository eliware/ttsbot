export function cancelCurrent(state) {
  if (!state.current) return;
  try { state.current.controller?.abort?.(); } catch {}
  try { state.current.source?.destroy?.(); } catch {}
  try { state.current.resampler?.destroy?.(); } catch {}
  try { state.current.jitterBuffer?.destroy?.(); } catch {}
  state.current = null;
}
