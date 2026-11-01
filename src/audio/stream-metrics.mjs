import { attachStreamMetricListeners } from './stream-metrics/listeners.mjs';

export function attachStreamMetrics({ source, resampler, metrics, receivedAt, guildId, userId, log, now }) {
  let audioBytes = 0;
  source.on('data', (chunk) => { audioBytes += chunk.length; });
  attachStreamMetricListeners({ source, resampler, metrics, receivedAt, guildId, userId, log, now, getAudioBytes: () => audioBytes });
  return () => audioBytes;
}
