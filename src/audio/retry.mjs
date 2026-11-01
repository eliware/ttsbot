import { isRetryableOpenAIError, openAIRetryDelay } from '../ttsPolicies.mjs';
import { requestSpeechOnce } from './openai-request.mjs';

export async function requestSpeech({
  client, input, voice, signal, guildId, userId, log,
  isRetryableOpenAIError: isRetryable = isRetryableOpenAIError,
  openAIRetryDelay: retryDelay = openAIRetryDelay,
  sleep,
}) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await requestSpeechOnce({ client, input, voice, signal });
      return { response };
    } catch (error) {
      if (signal.aborted) {
        log.debug('OpenAI TTS request aborted', { guildId, userId });
        return { aborted: true };
      }
      if (!isRetryable(error) || attempt === 3) {
        log.error('OpenAI TTS request error', error);
        return { failed: true };
      }
      const delayMs = retryDelay(attempt);
      log.warn('Retrying OpenAI TTS request', { guildId, userId, attempt, delayMs, status: error.status });
      try { await sleep(delayMs); }
      catch (delayError) {
        log.error('OpenAI TTS retry delay failed', delayError);
        return { failed: true };
      }
    }
  }
}
