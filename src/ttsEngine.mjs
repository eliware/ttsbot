import { createAudioPlayer, NoSubscriberBehavior } from '@discordjs/voice';
import { cancelCurrent } from './audioLifecycle.mjs';
import { log } from '@eliware/common';
import { playText } from './audio/playback.mjs';

// In-memory guild states
const guildStates = new Map();

function createGuildAudioPlayer(guildId) {
  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
      maxMissedFrames: 100,
    },
  });
  player.on('error', (err) => {
    log.error(`Discord audio player error for guild ${guildId}:`, err);
  });
  return player;
}

export function ensureGuildState(guildId) {
  if (!guildStates.has(guildId)) {
    guildStates.set(guildId, {
      connection: null,
      player: createGuildAudioPlayer(guildId),
      queue: [],
      playing: false,
      linkedTextChannelId: null,
      current: null,
    });
  }
  return guildStates.get(guildId);
}

// FIFO queue handling
export async function enqueueSpeech(guildId, item) {
  const state = ensureGuildState(guildId);
  state.queue.push(item);
  log.debug('TTS queue updated', { guildId, queueLength: state.queue.length, userId: item.userId, textLength: item.text?.length });
  if (!state.playing) {
    processQueue(guildId).catch((error) => log.error('Queue processing error', error));
  }
}

async function processQueue(guildId) {
  const state = ensureGuildState(guildId);
  if (state.playing) return;
  while (state.queue.length > 0) {
    const job = state.queue.shift();
    log.debug('TTS queue processing', { guildId, remaining: state.queue.length, userId: job.userId, queueWaitMs: job.receivedAt == null ? undefined : Math.round(performance.now() - job.receivedAt) });
    state.playing = true;
    try {
      await playText(guildId, job.text, job.userId, job.userTag, job.receivedAt, state);
    } catch (e) {
      log.error('Error playing TTS:', e);
    }
    state.playing = false;
  }
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

