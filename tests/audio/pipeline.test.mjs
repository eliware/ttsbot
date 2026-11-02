import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import { describe, expect, jest, test } from "@jest/globals";
import { Resampler } from "@eliware/resampler";
import { createAudioPipeline } from "../../src/audio/pipeline.mjs";

class FakeStream extends EventEmitter {
  pipe(destination) {
    return destination;
  }
}

function collect(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

describe("audio pipeline", () => {
  test("uses default pipeline dependencies", () => {
    expect(typeof createAudioPipeline({})).toBe("function");
  });

  test("builds the resampling and resource pipeline", () => {
    const source = new FakeStream();
    const buffer = new FakeStream();
    const resource = {};
    const createResource = jest.fn(() => resource);
    class FakeResampler extends FakeStream {
      constructor(options) {
        super();
        this.options = options;
      }
    }
    const pipeline = createAudioPipeline({
      ResamplerClass: FakeResampler,
      createBuffer: () => buffer,
      createResource,
      streamType: { Raw: "raw" },
      log: { error: jest.fn() },
    })(source);

    expect(pipeline).toMatchObject({ source, jitterBuffer: buffer, resource });
    expect(pipeline.resampler.options).toEqual({
      inRate: 24000,
      outRate: 48000,
      inChannels: 1,
      outChannels: 2,
      filterWindow: 8,
      volume: 1,
    });
    expect(createResource).toHaveBeenCalledWith(buffer, { inputType: "raw" });
  });

  test("resamples PCM frames split across input chunks", async () => {
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
    Readable.from([input.subarray(0, 3), input.subarray(3, 101), input.subarray(101)]).pipe(
      resampler,
    );
    const output = await outputPromise;
    expect(output.length).toBeGreaterThan(0);
    expect(output.length % 4).toBe(0);
  });

  test("rejects an incomplete final PCM frame", async () => {
    const resampler = new Resampler({
      inRate: 24000,
      outRate: 48000,
      inChannels: 1,
      outChannels: 2,
    });
    const outputPromise = collect(resampler);
    Readable.from([Buffer.from([0])]).pipe(resampler);
    await expect(outputPromise).rejects.toThrow();
  });
});
