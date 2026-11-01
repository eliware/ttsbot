import { cancelCurrent } from '../audioLifecycle.mjs';
import { log } from '@eliware/common';
import { processQueue } from './processor.mjs';
import { ensureGuildState } from './state.mjs';

export async function enqueueSpeech(guildId, item) {
  const state = ensureGuildState(guildId);
  state.queue.push(item);
  log.debug('TTS queue updated', { guildId, queueLength: state.queue.length, userId: item.userId, textLength: item.text?.length });
  if (!state.playing) processQueue(guildId).catch((error) => log.error('Queue processing error', error));
}

export async function skipCurrent(guildId) {
  const state = ensureGuildState(guildId);
  log.debug('Skipping current TTS', { guildId, queueLength: state.queue.length, hasCurrent: Boolean(state.current), playerStatus: state.player.state.status });
  if (state.player) state.player.stop(true);
  cancelCurrent(state);
}

export async function stopAndClear(guildId) {
  const state = ensureGuildState(guildId);
  log.debug('Stopping and clearing TTS', { guildId, queueLength: state.queue.length, hasCurrent: Boolean(state.current), playerStatus: state.player.state.status });
  state.queue = [];
  if (state.player) state.player.stop(true);
  cancelCurrent(state);
}
