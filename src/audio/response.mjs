import { toNodeReadable } from './audio-pipeline.mjs';
import { log as defaultLog } from '@eliware/common';

export function validateSpeechResponse({
  result, signal, receivedAt, metrics, now, guildId, userId, log = defaultLog,
}) {
  if (result.aborted || result.failed) return null;
  const response = result.response;
  metrics.responseReceivedAt = now();
  log.debug('OpenAI TTS response received', {
    guildId, userId, hasBody: Boolean(response?.body),
    requestMs: Math.round(metrics.responseReceivedAt - metrics.requestStartedAt),
    discordToOpenAIResponseMs: receivedAt == null ? undefined : Math.round(metrics.responseReceivedAt - receivedAt),
  });
  if (signal.aborted) {
    log.debug('Discarding canceled OpenAI TTS response', { guildId, userId });
    try { response.body?.cancel?.(); } catch {}
    return null;
  }
  if (!response?.body) {
    log.error('OpenAI TTS response did not include an audio body');
    return null;
  }
  const source = toNodeReadable(response.body);
  if (!source || typeof source.pipe !== 'function') {
    log.error('OpenAI TTS response body is not streamable');
    return null;
  }
  return { response, source };
}
