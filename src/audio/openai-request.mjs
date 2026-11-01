export async function requestSpeech({
  client,
  input,
  voice,
  signal,
  guildId,
  userId,
  log,
  isRetryableOpenAIError,
  openAIRetryDelay,
  sleep,
}) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await client.audio.speech.create({
        model: 'tts-1',
        input,
        voice,
        response_format: 'pcm',
        stream_format: 'audio',
        signal,
      });
      return { response };
    } catch (error) {
      if (signal.aborted) {
        log.debug('OpenAI TTS request aborted', { guildId, userId });
        return { aborted: true };
      }
      if (!isRetryableOpenAIError(error) || attempt === 3) {
        log.error('OpenAI TTS request error', error);
        return { failed: true };
      }
      const delayMs = openAIRetryDelay(attempt);
      log.warn('Retrying OpenAI TTS request', { guildId, userId, attempt, delayMs, status: error.status });
      await sleep(delayMs);
    }
  }
}
