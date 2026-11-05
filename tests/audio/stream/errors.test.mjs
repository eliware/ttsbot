import { EventEmitter } from "node:events";
import { describe, expect, jest, test } from "@jest/globals";
import { attachAudioStreamErrorHandlers } from "../../../src/audio/stream/errors.mjs";

describe("audio stream errors", () => {
  test("logs source and resampler errors", () => {
    const source = new EventEmitter();
    const resampler = new EventEmitter();
    const log = { error: jest.fn() };
    const onError = jest.fn();
    const removeHandlers = attachAudioStreamErrorHandlers({ source, resampler, log, onError });
    const sourceError = new Error("source error");
    const resamplerError = new Error("resampler error");
    source.emit("error", sourceError);
    resampler.emit("error", resamplerError);
    expect(log.error).toHaveBeenCalledWith("OpenAI TTS stream error", sourceError);
    expect(log.error).toHaveBeenCalledWith("PCM resampler error", resamplerError);
    expect(onError).toHaveBeenNthCalledWith(1, sourceError);
    expect(onError).toHaveBeenNthCalledWith(2, resamplerError);
    removeHandlers();
    expect(source.listenerCount("error")).toBe(0);
    expect(resampler.listenerCount("error")).toBe(0);
  });
});
