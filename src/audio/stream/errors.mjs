export function attachAudioStreamErrorHandlers({ source, resampler, log, onError }) {
  const handleSourceError = (error) => {
    log.error("OpenAI TTS stream error", error);
    onError(error);
  };
  const handleResamplerError = (error) => {
    log.error("PCM resampler error", error);
    onError(error);
  };
  source.on("error", handleSourceError);
  resampler.on("error", handleResamplerError);
  return () => {
    source.removeListener("error", handleSourceError);
    resampler.removeListener("error", handleResamplerError);
  };
}
