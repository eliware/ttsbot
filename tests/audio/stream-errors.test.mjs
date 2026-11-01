import { EventEmitter } from "node:events";
import { describe, expect, jest, test } from "@jest/globals";
import { attachAudioStreamErrorHandlers } from "../../src/audio/stream-errors.mjs";

describe("audio stream errors", () => {
  test("logs source and resampler errors", () => {
    const source = new EventEmitter();
    const resampler = new EventEmitter();
    const log = { error: jest.fn() };
    attachAudioStreamErrorHandlers({ source, resampler, log });
    const sourceError = new Error("source error");
    const resamplerError = new Error("resampler error");
    source.emit("error", sourceError);
    resampler.emit("error", resamplerError);
    expect(log.error).toHaveBeenCalledWith("OpenAI TTS stream error", sourceError);
    expect(log.error).toHaveBeenCalledWith("PCM resampler error", resamplerError);
  });
});
