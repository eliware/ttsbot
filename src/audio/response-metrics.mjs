export function recordSpeechResponseMetrics({ metrics, now, receivedAt, guildId, userId, hasBody, log }) {
  metrics.responseReceivedAt = now();
  log.debug('OpenAI TTS response received', {
    guildId, userId, hasBody,
    requestMs: Math.round(metrics.responseReceivedAt - metrics.requestStartedAt),
    discordToOpenAIResponseMs: receivedAt == null ? undefined : Math.round(metrics.responseReceivedAt - receivedAt),
  });
}
