export function parseJitterBufferMs(value = process.env.TTS_JITTER_BUFFER_MS) {
  return Math.min(1000, Math.max(0, Number.parseInt(value || "200", 10) || 0));
}
