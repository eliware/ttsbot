import { EventEmitter } from "node:events";
import { expect, jest, test } from "@jest/globals";
import { waitForPlayback } from "../../../src/audio/playback/events.mjs";

test("tracks playback, reports underruns, and cleans resources on idle", async () => {
  const player = new EventEmitter();
  player.play = jest.fn();
  const source = new EventEmitter();
  const resampler = new EventEmitter();
  const resource = {};
  const responseBody = { destroy: jest.fn() };
  const current = {
    source: { destroy: jest.fn() },
    resampler: { destroy: jest.fn() },
    jitterBuffer: { destroy: jest.fn() },
  };
  const state = { current, connection: { subscribe: jest.fn() } };
  const metrics = { requestStartedAt: 1 };
  const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const status = { Idle: "idle", Playing: "playing", Buffering: "buffering" };
  let now = 2;
  const done = waitForPlayback({
    source,
    response: { body: responseBody },
    resampler,
    jitterBuffer: current.jitterBuffer,
    resource,
    player,
    state,
    current,
    metrics,
    receivedAt: 1,
    guildId: "g",
    userId: "u",
    AudioStatus: status,
    log,
    now: () => now++,
  });
  player.emit(status.Buffering);
  player.emit(status.Playing);
  player.emit(status.Buffering);
  source.emit("data", Buffer.from("audio"));
  resampler.emit("data", Buffer.from("pcm"));
  player.emit(status.Idle);
  await done;
  expect(player.play).toHaveBeenCalledWith(resource);
  expect(state.connection.subscribe).toHaveBeenCalledWith(player);
  expect(log.warn).toHaveBeenCalledWith("Discord audio buffer underrun", {
    guildId: "g",
    userId: "u",
  });
  expect(responseBody.destroy).toHaveBeenCalled();
  expect(state.current).toBeNull();
});

test("cleans playback when no voice connection or audio data exists", async () => {
  const player = new EventEmitter();
  player.play = jest.fn();
  const current = { source: { destroy: jest.fn() } };
  const state = { current, connection: null };
  const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const done = waitForPlayback({
    source: new EventEmitter(),
    response: { body: null },
    resampler: new EventEmitter(),
    jitterBuffer: new EventEmitter(),
    resource: { ended: false, readable: true },
    player,
    state,
    current,
    metrics: { requestStartedAt: 1 },
    receivedAt: null,
    guildId: "g",
    userId: "u",
    AudioStatus: { Idle: "idle", Playing: "playing", Buffering: "buffering" },
    log,
    now: () => 2,
  });
  player.emit("buffering");
  player.emit("idle");
  await done;
  expect(log.warn).not.toHaveBeenCalled();
  expect(state.current).toBeNull();
});

test.each([
  ["source", "OpenAI TTS stream error", false],
  ["resampler", "PCM resampler error", false],
  ["source", "OpenAI TTS stream error", true],
])("stops playback and cleans up after a %s error", async (streamName, logMessage, stopFails) => {
  const player = new EventEmitter();
  player.play = jest.fn();
  const stopError = new Error("player stop failed");
  player.stop = jest.fn(() => {
    if (stopFails) throw stopError;
    player.emit("idle");
  });
  const source = new EventEmitter();
  const resampler = new EventEmitter();
  const current = {
    source: { destroy: jest.fn() },
    resampler: { destroy: jest.fn() },
    jitterBuffer: { destroy: jest.fn() },
  };
  const state = { current, connection: null };
  const error = new Error(`${streamName} failed`);
  const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const done = waitForPlayback({
    source,
    response: { body: null },
    resampler,
    jitterBuffer: current.jitterBuffer,
    resource: { ended: false, readable: true },
    player,
    state,
    current,
    metrics: { requestStartedAt: 1 },
    receivedAt: null,
    guildId: "g",
    userId: "u",
    AudioStatus: { Idle: "idle", Playing: "playing", Buffering: "buffering" },
    log,
    now: () => 2,
  });

  (streamName === "source" ? source : resampler).emit("error", error);
  await done;

  expect(player.stop).toHaveBeenCalledWith(true);
  expect(log.error).toHaveBeenCalledWith(logMessage, error);
  if (stopFails)
    expect(log.error).toHaveBeenCalledWith(
      "Discord audio player stop failed after a stream error",
      stopError,
    );
  expect(current.source.destroy).toHaveBeenCalled();
  expect(current.resampler.destroy).toHaveBeenCalled();
  expect(current.jitterBuffer.destroy).toHaveBeenCalled();
  expect(state.current).toBeNull();
  expect(source.listenerCount("error")).toBe(0);
  expect(resampler.listenerCount("error")).toBe(0);
});
