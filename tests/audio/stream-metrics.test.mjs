import { EventEmitter } from 'node:events';
import { describe, expect, jest, test } from '@jest/globals';
import { attachStreamMetrics } from '../../src/audio/stream-metrics.mjs';

describe('audio stream metrics', () => {
  test('records first and last bytes from the source and resampler', () => {
    const source = new EventEmitter();
    const resampler = new EventEmitter();
    const metrics = { requestStartedAt: 10 };
    const log = { debug: jest.fn() };
    let time = 20;
    const getAudioBytes = attachStreamMetrics({
      source, resampler, metrics, receivedAt: 15, guildId: 'g', userId: 'u', log, now: () => time++,
    });
    source.emit('data', Buffer.alloc(2));
    source.emit('data', Buffer.alloc(3));
    source.emit('end');
    resampler.emit('data');
    resampler.emit('data');
    resampler.emit('end');
    expect(getAudioBytes()).toBe(5);
    expect(metrics.openaiFirstByteAt).toBe(20);
    expect(metrics.openaiLastByteAt).toBe(21);
    expect(metrics.resamplerFirstByteAt).toBe(22);
    expect(metrics.resamplerLastByteAt).toBe(23);
    expect(log.debug).toHaveBeenCalledWith('OpenAI TTS stream ended', expect.objectContaining({ audioBytes: 5 }));
  });
});
