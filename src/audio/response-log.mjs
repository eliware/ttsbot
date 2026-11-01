export function logSpeechResponse({ log, metrics, receivedAt, guildId, userId, hasBody }) {
  log.debug('OpenAI TTS response received', {
    guildId, userId, hasBody,
    requestMs: Math.round(metrics.responseReceivedAt - metrics.requestStartedAt),
    discordToOpenAIResponseMs: receivedAt == null ? undefined : Math.round(metrics.responseReceivedAt - receivedAt),
  });
}
