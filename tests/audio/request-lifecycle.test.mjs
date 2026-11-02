import { Readable } from "node:stream";
import { expect, jest, test } from "@jest/globals";
import { executeSpeechRequest } from "../../src/audio/request-lifecycle.mjs";

test("stores request state and returns a validated audio stream", async () => {
  const response = { body: Readable.from([Buffer.from("audio")]) };
  const state = {};
  const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };
  const result = await executeSpeechRequest({
    state,
    client: { audio: { speech: { create: async () => response } } },
    inputText: "hello",
    voice: "coral",
    receivedAt: 5,
    guildId: "g",
    userId: "u",
    log,
    now: () => 10,
    sleep: async () => {},
  });
  expect(result.audio.response).toBe(response);
  expect(result.audio.source).toBeInstanceOf(Readable);
  expect(state.current).toBe(result.current);
  expect(result.metrics.requestStartedAt).toBe(10);
});

test("clears request state when speech generation fails", async () => {
  const state = {};
  const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };
  const result = await executeSpeechRequest({
    state,
    client: {
      audio: {
        speech: {
          create: async () => {
            throw { status: 401 };
          },
        },
      },
    },
    inputText: "hello",
    voice: "coral",
    receivedAt: 5,
    guildId: "g",
    userId: "u",
    log,
    now: () => 10,
    sleep: async () => {},
  });
  expect(result).toBeNull();
  expect(state.current).toBeNull();
});

test("preserves newer request state when an older request fails", async () => {
  const newerRequest = { controller: new AbortController() };
  const state = {};
  const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };
  const result = await executeSpeechRequest({
    state,
    client: {
      audio: {
        speech: {
          create: async () => {
            state.current = newerRequest;
            return {};
          },
        },
      },
    },
    inputText: "hello",
    voice: "coral",
    receivedAt: 5,
    guildId: "g",
    userId: "u",
    log,
    now: () => 10,
    sleep: async () => {},
  });
  expect(result).toBeNull();
  expect(state.current).toBe(newerRequest);
});
