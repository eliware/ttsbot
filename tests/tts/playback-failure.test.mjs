import { expect, jest, test } from "@jest/globals";
import { logPlaybackFailure } from "../../src/tts/playback-failure.mjs";

test("logs playback failures", () => {
  const error = new Error("playback failed");
  const log = { error: jest.fn() };
  logPlaybackFailure(error, log);
  expect(log.error).toHaveBeenCalledWith("Error playing TTS:", error);
});
