import { shouldLogBufferUnderrun } from '../ttsPolicies.mjs';

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
  let audioBytes = 0;
  source.on('data', (chunk) => {
    if (metrics.openaiFirstByteAt == null) {
      metrics.openaiFirstByteAt = now();
      log.debug('OpenAI TTS first audio byte', {
        guildId, userId, firstByteMs: Math.round(metrics.openaiFirstByteAt - metrics.requestStartedAt),
        discordToFirstOpenAIMs: receivedAt == null ? undefined : Math.round(metrics.openaiFirstByteAt - receivedAt),
      });
    }
    audioBytes += chunk.length;
  });
  source.on('end', () => {
    metrics.openaiLastByteAt = now();
    log.debug('OpenAI TTS stream ended', {
      guildId, userId, audioBytes,
      openaiStreamMs: Math.round(metrics.openaiLastByteAt - metrics.openaiFirstByteAt),
      requestToLastOpenAIMs: Math.round(metrics.openaiLastByteAt - metrics.requestStartedAt),
    });
  });
  resampler.on('data', () => {
    if (metrics.resamplerFirstByteAt == null) {
      metrics.resamplerFirstByteAt = now();
      log.debug('Discord audio first PCM byte ready', {
        guildId, userId, resamplerMs: Math.round(metrics.resamplerFirstByteAt - metrics.requestStartedAt),
      });
    }
  });
  resampler.on('end', () => {
    metrics.resamplerLastByteAt = now();
    log.debug('Discord audio last PCM byte ready', {
      guildId, userId,
      resampledAudioMs: Math.round(metrics.resamplerLastByteAt - metrics.resamplerFirstByteAt),
    });
  });

  return new Promise((resolve) => {
    const onIdle = () => {
      player.removeListener(AudioStatus.Idle, onIdle);
      player.removeListener(AudioStatus.Playing, onPlaying);
      player.removeListener(AudioStatus.Buffering, onBuffering);
      metrics.playbackIdleAt = now();
      log.debug('Discord TTS playback idle', {
        guildId, userId, audioBytes,
        playbackTotalMs: Math.round(metrics.playbackIdleAt - metrics.requestStartedAt),
        openaiToPlaybackIdleMs: metrics.openaiFirstByteAt == null ? undefined : Math.round(metrics.playbackIdleAt - metrics.openaiFirstByteAt),
      });
      try { response.body.destroy(); } catch {}
      try { resampler.destroy(); } catch {}
      try { jitterBuffer.destroy(); } catch {}
      if (state.current === current) state.current = null;
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
