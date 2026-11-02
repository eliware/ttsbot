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
    resource: {},
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
