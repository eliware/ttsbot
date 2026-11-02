import { attachStreamMetrics } from "../stream/metrics.mjs";

export function attachPlaybackMetrics(options) {
  return attachStreamMetrics(options);
}

export function logPlaybackStarted({ metrics, receivedAt, guildId, userId, log, now }) {
  if (metrics.playbackFirstByteAt != null) return false;
  metrics.playbackFirstByteAt = now();
  log.debug("Discord audio playback started", {
    guildId,
    userId,
    playbackStartMs: Math.round(metrics.playbackFirstByteAt - metrics.requestStartedAt),
    discordToPlaybackMs:
      receivedAt == null ? undefined : Math.round(metrics.playbackFirstByteAt - receivedAt),
  });
  return true;
}

export function logPlaybackIdle({ metrics, getAudioBytes, guildId, userId, log, now }) {
  metrics.playbackIdleAt = now();
  log.debug("Discord TTS playback idle", {
    guildId,
    userId,
    audioBytes: getAudioBytes(),
    playbackTotalMs: Math.round(metrics.playbackIdleAt - metrics.requestStartedAt),
    openaiToPlaybackIdleMs:
      metrics.openaiFirstByteAt == null
        ? undefined
        : Math.round(metrics.playbackIdleAt - metrics.openaiFirstByteAt),
  });
}
