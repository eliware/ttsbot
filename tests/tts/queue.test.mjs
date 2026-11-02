import { afterEach, expect, jest, test } from "@jest/globals";

const state = { queue: [], playing: false };
const processQueue = jest.fn(async () => {});
const log = { debug: jest.fn(), error: jest.fn() };
jest.unstable_mockModule("@eliware/common", () => ({ log }));
jest.unstable_mockModule("../../src/tts/state.mjs", () => ({ ensureGuildState: () => state }));
jest.unstable_mockModule("../../src/tts/processor.mjs", () => ({ processQueue }));
const { enqueueSpeech } = await import("../../src/tts/queue.mjs");

afterEach(() => {
  state.queue = [];
  state.playing = false;
  processQueue.mockReset().mockResolvedValue(undefined);
  log.debug.mockClear();
  log.error.mockClear();
});

test("adds speech to the queue and starts idle playback", async () => {
  await enqueueSpeech("g", { userId: "u", text: "hello" });
  expect(state.queue).toEqual([{ userId: "u", text: "hello" }]);
  expect(processQueue).toHaveBeenCalledWith("g");
  expect(log.debug).toHaveBeenCalledWith(
    "TTS queue updated",
    expect.objectContaining({ queueLength: 1 }),
  );
});

test("does not start another processor while the guild is playing", async () => {
  state.playing = true;
  await enqueueSpeech("g", { userId: "u", text: "hello" });
  expect(processQueue).not.toHaveBeenCalled();
});

test("logs asynchronous queue processor failures", async () => {
  const error = new Error("queue failed");
  processQueue.mockRejectedValue(error);
  await enqueueSpeech("g", { userId: "u", text: "hello" });
  await Promise.resolve();
  expect(log.error).toHaveBeenCalledWith("Queue processing error", error);
});
