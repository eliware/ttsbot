export function cleanupCurrent(current, { responseBody, abort = true } = {}) {
  if (!current) return;
  if (abort) { try { current.controller?.abort?.(); } catch {} }
  try { current.source?.destroy?.(); } catch {}
  try { current.resampler?.destroy?.(); } catch {}
  try { current.jitterBuffer?.destroy?.(); } catch {}
  if (responseBody !== current.source) {
    try { responseBody?.destroy?.(); } catch {}
    if (typeof responseBody?.destroy !== 'function') cancelResponseBody(responseBody);
  }
}

export function cancelResponseBody(responseBody) {
  try {
    if (typeof responseBody?.destroy === 'function') responseBody.destroy();
    else responseBody?.cancel?.()?.catch?.(() => {});
  } catch {}
}

