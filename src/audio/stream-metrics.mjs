import { attachStreamMetricListeners } from './stream-metrics/listeners.mjs';
import { attachAudioByteCounter } from './stream-metrics/byte-counter.mjs';

export function attachStreamMetrics({ source, resampler, metrics, receivedAt, guildId, userId, log, now }) {
  const getAudioBytes = attachAudioByteCounter(source);
  attachStreamMetricListeners({ source, resampler, metrics, receivedAt, guildId, userId, log, now, getAudioBytes });
  return getAudioBytes;
}
