import { shouldLogBufferUnderrun } from "../../ttsPolicies.mjs";
import { attachAudioStreamErrorHandlers } from "../stream/errors.mjs";
import { attachStreamMetrics } from "../stream/metrics.mjs";
import { logPlaybackIdle, logPlaybackStarted } from "./metrics.mjs";
import { cleanupPlayback } from "./cleanup.mjs";

export function waitForPlayback({
  source,
  jitterBuffer,
  response,
  resampler,
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
  const getAudioBytes = attachStreamMetrics({
    source,
    resampler,
    metrics,
    receivedAt,
    guildId,
    userId,
    log,
    now,
  });

  return new Promise((resolve) => {
    let settled = false;
    let removeStreamErrorHandlers;
    const onIdle = () => {
      if (settled) return;
      settled = true;
      removeStreamErrorHandlers();
      player.removeListener(AudioStatus.Idle, onIdle);
      player.removeListener(AudioStatus.Playing, onPlaying);
      player.removeListener(AudioStatus.Buffering, onBuffering);
      logPlaybackIdle({
        metrics,
        getAudioBytes,
        source,
        resampler,
        jitterBuffer,
        resource,
        guildId,
        userId,
        log,
        now,
      });
      cleanupPlayback({ state, current, responseBody: response.body });
      resolve();
    };
    const onStreamError = () => {
      try {
        player.stop(true);
      } catch (error) {
        log.error("Discord audio player stop failed after a stream error", error);
      } finally {
        onIdle();
      }
    };
    const onBuffering = () => {
      if (shouldLogBufferUnderrun(metrics.playbackFirstByteAt != null))
        log.warn("Discord audio buffer underrun", { guildId, userId });
    };
    const onPlaying = () => {
      logPlaybackStarted({ metrics, receivedAt, guildId, userId, log, now });
    };
    removeStreamErrorHandlers = attachAudioStreamErrorHandlers({
      source,
      resampler,
      log,
      onError: onStreamError,
    });
    player.on(AudioStatus.Idle, onIdle);
    player.on(AudioStatus.Playing, onPlaying);
    player.on(AudioStatus.Buffering, onBuffering);
    if (state.connection) state.connection.subscribe(player);
    player.play(resource);
  });
}
