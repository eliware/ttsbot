import { EventEmitter } from 'node:events';
import { describe, expect, jest, test } from '@jest/globals';
import { createAudioPipeline, toNodeReadable } from '../../src/audio/audio-pipeline.mjs';

class FakeStream extends EventEmitter {
  pipe(destination) { return destination; }
}

describe('audio pipeline', () => {
  test('converts Web streams and preserves already streamable bodies', () => {
    const webStream = new ReadableStream({ start(controller) { controller.close(); } });
    expect(typeof toNodeReadable(webStream).pipe).toBe('function');
    const body = {};
    expect(toNodeReadable(body)).toBe(body);
  });

  test('builds the resampling and resource pipeline', () => {
    const source = new FakeStream();
    const resampler = new FakeStream();
    const buffer = new FakeStream();
    const resource = {};
    const createResource = jest.fn(() => resource);
    class FakeResampler extends FakeStream {
      constructor(options) { super(); this.options = options; }
    }
    const pipeline = createAudioPipeline({
      ResamplerClass: FakeResampler,
      createBuffer: () => buffer,
      createResource,
      streamType: { Raw: 'raw' },
      log: { error: jest.fn() },
    })(source);

    expect(pipeline).toMatchObject({ source, jitterBuffer: buffer, resource });
    expect(pipeline.resampler.options).toEqual({
      inRate: 24000, outRate: 48000, inChannels: 1, outChannels: 2, filterWindow: 8, volume: 1,
    });
    expect(createResource).toHaveBeenCalledWith(buffer, { inputType: 'raw' });
  });
});
