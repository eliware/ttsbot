import { Readable } from 'node:stream';
import { describe, expect, test } from '@jest/globals';
import { Resampler } from '@eliware/resampler';

function collect(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

describe('resampler integration', () => {
  test('handles PCM frames split across input chunks', async () => {
    const input = Buffer.alloc(240 * 2);
    const resampler = new Resampler({
      inRate: 24000,
      outRate: 48000,
      inChannels: 1,
      outChannels: 2,
      filterWindow: 8,
      volume: 1,
    });
    const outputPromise = collect(resampler);
    Readable.from([input.subarray(0, 3), input.subarray(3, 101), input.subarray(101)]).pipe(resampler);
    const output = await outputPromise;
    expect(output.length).toBeGreaterThan(0);
    expect(output.length % 4).toBe(0);
  });

  test('rejects an incomplete final PCM frame', async () => {
    const resampler = new Resampler({ inRate: 24000, outRate: 48000, inChannels: 1, outChannels: 2 });
    const outputPromise = collect(resampler);
    Readable.from([Buffer.from([0])]).pipe(resampler);
    await expect(outputPromise).rejects.toThrow();
  });
});
