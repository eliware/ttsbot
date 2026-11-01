export function attachAudioStreamErrorHandlers({ source, resampler, log }) {
  source.on('error', (error) => log.error('OpenAI TTS stream error', error));
  resampler.on('error', (error) => log.error('PCM resampler error', error));
}
