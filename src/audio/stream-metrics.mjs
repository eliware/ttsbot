export function attachStreamMetrics({ source, resampler, metrics, receivedAt, guildId, userId, log, now }) {
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
  return () => audioBytes;
}
