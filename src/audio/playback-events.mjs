import { shouldLogBufferUnderrun } from '../ttsPolicies.mjs';
import { attachPlaybackMetrics, logPlaybackIdle, logPlaybackStarted } from './playback-metrics.mjs';
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
  const getAudioBytes = attachPlaybackMetrics({ source, resampler, metrics, receivedAt, guildId, userId, log, now });

  return new Promise((resolve) => {
    const onIdle = () => {
      player.removeListener(AudioStatus.Idle, onIdle);
      player.removeListener(AudioStatus.Playing, onPlaying);
      player.removeListener(AudioStatus.Buffering, onBuffering);
      logPlaybackIdle({ metrics, getAudioBytes, guildId, userId, log, now });
      cleanupPlayback({ state, current, responseBody: response.body });
      resolve();
    };
    const onBuffering = () => {
      if (shouldLogBufferUnderrun(metrics.playbackFirstByteAt != null)) log.warn('Discord audio buffer underrun', { guildId, userId });
    };
    const onPlaying = () => {
      logPlaybackStarted({ metrics, receivedAt, guildId, userId, log, now });
    };
    player.on(AudioStatus.Idle, onIdle);
    player.on(AudioStatus.Playing, onPlaying);
    player.on(AudioStatus.Buffering, onBuffering);
    if (state.connection) state.connection.subscribe(player);
    player.play(resource);
  });
}
