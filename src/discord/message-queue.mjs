export async function enqueueMessageForSpeech({ enqueueSpeech, guildId, channelId, content, userId, userTag, log, receivedAt = performance.now() }) {
  log.debug('messageCreate enqueueing TTS', { guildId, channelId, userId, length: content.length });
  await enqueueSpeech(guildId, { text: content, userId, userTag, receivedAt });
}
