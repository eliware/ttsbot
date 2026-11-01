export function attachStreamMetricListeners({ source, resampler, metrics, receivedAt, guildId, userId, log, now, getAudioBytes }) {
  source.on('data', () => {
    if (metrics.openaiFirstByteAt != null) return;
    metrics.openaiFirstByteAt = now();
    log.debug('OpenAI TTS first audio byte', {
      guildId, userId, firstByteMs: Math.round(metrics.openaiFirstByteAt - metrics.requestStartedAt),
      discordToFirstOpenAIMs: receivedAt == null ? undefined : Math.round(metrics.openaiFirstByteAt - receivedAt),
    });
  });
  source.on('end', () => {
    metrics.openaiLastByteAt = now();
    log.debug('OpenAI TTS stream ended', {
      guildId, userId, audioBytes: getAudioBytes(),
      openaiStreamMs: metrics.openaiFirstByteAt == null ? undefined : Math.round(metrics.openaiLastByteAt - metrics.openaiFirstByteAt),
      requestToLastOpenAIMs: Math.round(metrics.openaiLastByteAt - metrics.requestStartedAt),
    });
  });
  resampler.on('data', () => {
    if (metrics.resamplerFirstByteAt != null) return;
    metrics.resamplerFirstByteAt = now();
    log.debug('Discord audio first PCM byte ready', {
      guildId, userId, resamplerMs: Math.round(metrics.resamplerFirstByteAt - metrics.requestStartedAt),
    });
  });
  resampler.on('end', () => {
    metrics.resamplerLastByteAt = now();
    log.debug('Discord audio last PCM byte ready', {
      guildId, userId,
      resampledAudioMs: metrics.resamplerFirstByteAt == null ? undefined : Math.round(metrics.resamplerLastByteAt - metrics.resamplerFirstByteAt),
    });
  });
}
