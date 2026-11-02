export function recordSpeechResponseTiming(metrics, now) {
  metrics.responseReceivedAt = now();
  return metrics.responseReceivedAt;
}
