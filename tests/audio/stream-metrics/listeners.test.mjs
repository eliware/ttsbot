import { EventEmitter } from "node:events";
import { describe, expect, jest, test } from "@jest/globals";
import { attachStreamMetricListeners } from "../../../src/audio/stream-metrics/listeners.mjs";

describe("stream metric listeners", () => {
  test("logs source timing when receive time is unknown", () => {
    const source = new EventEmitter();
    const resampler = new EventEmitter();
    const log = { debug: jest.fn() };
    attachStreamMetricListeners({
      source,
      resampler,
      metrics: { requestStartedAt: 1 },
      guildId: "g",
      userId: "u",
      log,
      now: () => 2,
      getAudioBytes: () => 1,
    });
    source.emit("data");
    expect(log.debug).toHaveBeenCalledWith(
      "OpenAI TTS first audio byte",
      expect.objectContaining({ discordToFirstOpenAIMs: undefined }),
    );
  });

  test("records source and resampler timing events", () => {
    const source = new EventEmitter();
    const resampler = new EventEmitter();
    const metrics = { requestStartedAt: 10 };
    const log = { debug: jest.fn() };
    let time = 20;
    attachStreamMetricListeners({
      source,
      resampler,
      metrics,
      receivedAt: 15,
      guildId: "g",
      userId: "u",
      log,
      now: () => time++,
      getAudioBytes: () => 7,
    });
    source.emit("data");
    source.emit("data");
    source.emit("end");
    resampler.emit("data");
    resampler.emit("data");
    resampler.emit("end");
    expect(metrics.openaiFirstByteAt).toBe(20);
    expect(metrics.resamplerFirstByteAt).toBe(22);
    expect(log.debug).toHaveBeenCalledWith(
      "OpenAI TTS stream ended",
      expect.objectContaining({ audioBytes: 7 }),
    );
  });

  test("does not report stream duration when a stream has no data", () => {
    const source = new EventEmitter();
    const resampler = new EventEmitter();
    const metrics = { requestStartedAt: 10 };
    const log = { debug: jest.fn() };
    let time = 20;
    attachStreamMetricListeners({
      source,
      resampler,
      metrics,
      guildId: "g",
      userId: "u",
      log,
      now: () => time++,
      getAudioBytes: () => 0,
    });
    source.emit("end");
    resampler.emit("end");
    expect(log.debug).toHaveBeenCalledWith(
      "OpenAI TTS stream ended",
      expect.objectContaining({ openaiStreamMs: undefined }),
    );
    expect(log.debug).toHaveBeenCalledWith(
      "Discord audio last PCM byte ready",
      expect.objectContaining({ resampledAudioMs: undefined }),
    );
  });
});
