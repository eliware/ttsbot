import { shouldLogBufferUnderrun } from '../ttsPolicies.mjs';
import { attachStreamMetrics } from './stream-metrics.mjs';
import { cleanupPlayback } from './playback-cleanup.mjs';

export function waitForPlayback({
  source,
  response,
  resampler,
  jitterBuffer,
  resource,
  player,
  state,
  current,
  metrics,
  receivedAt,
  guildId,
  userId,
  AudioStatus,
  log,
  now,
}) {
  const getAudioBytes = attachStreamMetrics({ source, resampler, metrics, receivedAt, guildId, userId, log, now });

  return new Promise((resolve) => {
    const onIdle = () => {
      player.removeListener(AudioStatus.Idle, onIdle);
      player.removeListener(AudioStatus.Playing, onPlaying);
      player.removeListener(AudioStatus.Buffering, onBuffering);
      metrics.playbackIdleAt = now();
      log.debug('Discord TTS playback idle', {
        guildId, userId, audioBytes: getAudioBytes(),
        playbackTotalMs: Math.round(metrics.playbackIdleAt - metrics.requestStartedAt),
        openaiToPlaybackIdleMs: metrics.openaiFirstByteAt == null ? undefined : Math.round(metrics.playbackIdleAt - metrics.openaiFirstByteAt),
      });
      cleanupPlayback({ state, current, responseBody: response.body });
      resolve();
    };
    const onBuffering = () => {
      if (shouldLogBufferUnderrun(metrics.playbackFirstByteAt != null)) log.warn('Discord audio buffer underrun', { guildId, userId });
    };
    const onPlaying = () => {
      if (metrics.playbackFirstByteAt != null) return;
      metrics.playbackFirstByteAt = now();
      log.debug('Discord audio playback started', {
        guildId, userId,
        playbackStartMs: Math.round(metrics.playbackFirstByteAt - metrics.requestStartedAt),
        discordToPlaybackMs: receivedAt == null ? undefined : Math.round(metrics.playbackFirstByteAt - receivedAt),
      });
    };
    player.on(AudioStatus.Idle, onIdle);
    player.on(AudioStatus.Playing, onPlaying);
    player.on(AudioStatus.Buffering, onBuffering);
    if (state.connection) state.connection.subscribe(player);
    player.play(resource);
  });
}
