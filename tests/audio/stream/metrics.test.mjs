import { EventEmitter } from "node:events";
import { describe, expect, test } from "@jest/globals";
import { attachStreamMetrics } from "../../../src/audio/stream/metrics.mjs";

describe("audio stream metrics", () => {
  test("records source byte counts and first byte timing", () => {
    const source = new EventEmitter();
    const resampler = new EventEmitter();
    const metrics = { requestStartedAt: 10 };
    const log = { debug: () => {} };
    const getAudioBytes = attachStreamMetrics({
      source,
      resampler,
      metrics,
      receivedAt: 15,
      guildId: "g",
      userId: "u",
      log,
      now: () => 30,
    });
    source.emit("data", Buffer.alloc(2));
    source.emit("data", Buffer.alloc(3));
    resampler.emit("data", Buffer.alloc(4));
    expect(getAudioBytes()).toBe(5);
    expect(getAudioBytes()).toBe(5);
    expect(metrics.openaiFirstByteAt).toBe(30);
    expect(metrics.resamplerFirstByteAt).toBe(30);
  });
});
