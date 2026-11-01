import { log } from '@eliware/common';
import { processQueue } from './processor.mjs';
import { ensureGuildState } from './state.mjs';
export async function enqueueSpeech(guildId, item) {
  const state = ensureGuildState(guildId);
  state.queue.push(item);
  log.debug('TTS queue updated', { guildId, queueLength: state.queue.length, userId: item.userId, textLength: item.text?.length });
  if (!state.playing) processQueue(guildId).catch((error) => log.error('Queue processing error', error));
}

