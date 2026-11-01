export function cancelSpeechResponseBody(body) {
  try { body?.cancel?.(); } catch {}
}
