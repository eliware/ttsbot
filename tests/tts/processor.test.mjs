import { describe, expect, jest, test } from "@jest/globals";
import { createQueueProcessor } from "../../src/tts/processor.mjs";
import { createStopAction } from "../../src/tts/stop.mjs";

describe("TTS queue processor", () => {
  test("plays queued jobs in order and clears the playing flag", async () => {
    const state = {
      queue: [
        { text: "first", userId: "one", userTag: "one#1", receivedAt: 1 },
        { text: "second", userId: "two", userTag: "two#1" },
      ],
      playing: false,
    };
    const playText = jest.fn(async () => {});
    const processQueue = createQueueProcessor({
      getGuildState: () => state,
      playText,
      log: { debug: jest.fn(), error: jest.fn() },
    });
    await processQueue("guild");
    expect(playText).toHaveBeenNthCalledWith(1, "guild", "first", "one", "one#1", 1, state);
    expect(playText).toHaveBeenNthCalledWith(
      2,
      "guild",
      "second",
      "two",
      "two#1",
      undefined,
      state,
    );
    expect(state).toMatchObject({ queue: [], playing: false });
  });

  test("does not start a second processor and continues after playback errors", async () => {
    const busy = { queue: [{ text: "pending" }], playing: true };
    const playText = jest.fn();
    await createQueueProcessor({ getGuildState: () => busy, playText })("guild");
    expect(playText).not.toHaveBeenCalled();

    const state = { queue: [{ text: "bad" }, { text: "good" }], playing: false };
    const error = new Error("playback failed");
    const logger = { debug: jest.fn(), error: jest.fn() };
    const recover = jest.fn().mockRejectedValueOnce(error).mockResolvedValueOnce(undefined);
    await createQueueProcessor({ getGuildState: () => state, playText: recover, log: logger })(
      "guild",
    );
    expect(recover).toHaveBeenCalledTimes(2);
    expect(logger.error).toHaveBeenCalledWith("Error playing TTS:", error);
    expect(state.playing).toBe(false);
  });

  test("shares the active processor for concurrent calls", async () => {
    let finishPlayback;
    const state = {
      queue: [{ text: "first" }],
      playing: false,
      processing: null,
    };
    const playText = jest.fn(() => new Promise((resolve) => (finishPlayback = resolve)));
    const processQueue = createQueueProcessor({
      getGuildState: () => state,
      playText,
      log: { debug: jest.fn(), error: jest.fn() },
    });
    const first = processQueue("guild");
    const second = processQueue("guild");
    expect(second).toBe(first);
    finishPlayback();
    await first;
    expect(playText).toHaveBeenCalledTimes(1);
  });

  test("restarts processing for jobs queued as the active loop ends", async () => {
    const state = {
      queue: [],
      playing: false,
      stopping: false,
      queueGeneration: 0,
      processing: null,
    };
    const playText = jest.fn(async () => {});
    const processQueue = createQueueProcessor({
      getGuildState: () => state,
      playText,
      log: { debug: jest.fn(), error: jest.fn() },
    });
    const first = processQueue("guild");
    state.queue.push({ text: "late", userId: "user" });
    await first;
    await state.processing;
    expect(playText).toHaveBeenCalledTimes(1);
    expect(state.queue).toEqual([]);
  });

  test("logs failures from a restarted processor", async () => {
    const state = {
      queue: [],
      playing: false,
      stopping: false,
      queueGeneration: 0,
      processing: null,
    };
    const failure = new Error("restart failed");
    let rejectPlayback;
    const log = {
      debug: jest.fn(),
      error: jest.fn((message) => {
        if (message === "Error playing TTS:") throw failure;
      }),
    };
    const processQueue = createQueueProcessor({
      getGuildState: () => state,
      playText: () => new Promise((resolve, reject) => (rejectPlayback = reject)),
      log,
    });
    const first = processQueue("guild");
    state.queue.push({ text: "late", userId: "user" });
    await first;
    const restarted = state.processing;
    rejectPlayback(failure);
    await expect(restarted).rejects.toBe(failure);
    expect(log.error).toHaveBeenCalledWith("Queue processing error", failure);
  });

  test("resets playing when error logging throws during recovery", async () => {
    const state = { queue: [{ text: "bad" }], playing: false };
    const processQueue = createQueueProcessor({
      getGuildState: () => state,
      playText: async () => {
        throw new Error("playback failed");
      },
      log: {
        debug: jest.fn(),
        error: () => {
          throw new Error("logger failed");
        },
      },
    });
    await expect(processQueue("guild")).rejects.toThrow("logger failed");
    expect(state.playing).toBe(false);
  });

  test("clears jobs added while stop waits for current playback", async () => {
    let finishPlayback;
    const current = { controller: { abort: jest.fn() } };
    const state = {
      queue: [{ text: "current", userId: "user" }],
      playing: false,
      stopping: false,
      queueGeneration: 0,
      processing: null,
      current,
      player: { state: { status: "playing" }, stop: jest.fn() },
    };
    const playText = jest.fn(() => new Promise((resolve) => (finishPlayback = resolve)));
    const log = { debug: jest.fn(), error: jest.fn() };
    const processQueue = createQueueProcessor({ getGuildState: () => state, playText, log });
    const processing = processQueue("guild");
    const stop = createStopAction({ getGuildState: () => state, log });

    const stopping = stop("guild");
    state.queue.push({ text: "during stop", userId: "user" });
    finishPlayback();
    await Promise.all([processing, stopping]);

    expect(playText).toHaveBeenCalledTimes(1);
    expect(state.queue).toEqual([]);
    expect(state.playing).toBe(false);
    expect(state.stopping).toBe(false);
    expect(current.controller.abort).toHaveBeenCalled();
  });
});
