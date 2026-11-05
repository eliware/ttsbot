import { expect, jest, test } from "@jest/globals";
import { requestSpeech } from "../../src/audio/retry.mjs";

test("returns the first response with the expected speech settings", async () => {
  const response = { body: Buffer.from("audio") };
  const create = jest.fn(async () => response);
  const signal = new AbortController().signal;
  const result = await requestSpeech({
    client: { audio: { speech: { create } } },
    input: "hello",
    voice: "coral",
    signal,
    guildId: "g",
    userId: "u",
    log: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
    sleep: async () => {},
  });
  expect(result).toEqual({ response });
  expect(create).toHaveBeenCalledTimes(1);
  expect(create).toHaveBeenCalledWith({
    model: "tts-1",
    input: "hello",
    voice: "coral",
    response_format: "pcm",
    stream_format: "audio",
    signal,
  });
});

test("retries a rate limit and returns a later response", async () => {
  const response = { body: "audio" };
  const create = jest.fn().mockRejectedValueOnce({ status: 429 }).mockResolvedValue(response);
  const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };
  const sleep = jest.fn(async () => {});
  const signal = new AbortController().signal;

  await expect(
    requestSpeech({
      client: { audio: { speech: { create } } },
      input: "hello",
      voice: "coral",
      signal,
      guildId: "guild",
      userId: "user",
      log,
      sleep,
    }),
  ).resolves.toEqual({ response });

  expect(create).toHaveBeenCalledTimes(2);
  expect(sleep).toHaveBeenCalledWith(250);
  expect(log.warn).toHaveBeenCalledWith("Retrying OpenAI TTS request", {
    guildId: "guild",
    userId: "user",
    attempt: 1,
    delayMs: 250,
    status: 429,
  });
});

test("stops after three retryable failures", async () => {
  const error = { status: 500 };
  const create = jest.fn().mockRejectedValue(error);
  const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };
  const sleep = jest.fn(async () => {});

  await expect(
    requestSpeech({
      client: { audio: { speech: { create } } },
      input: "hello",
      voice: "coral",
      signal: new AbortController().signal,
      guildId: "guild",
      userId: "user",
      log,
      sleep,
    }),
  ).resolves.toEqual({ failed: true });

  expect(create).toHaveBeenCalledTimes(3);
  expect(sleep.mock.calls).toEqual([[250], [500]]);
  expect(log.error).toHaveBeenCalledWith("OpenAI TTS request error", error);
});

test("does not retry a non-retryable failure", async () => {
  const error = { status: 401 };
  const create = jest.fn().mockRejectedValue(error);
  const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };

  await expect(
    requestSpeech({
      client: { audio: { speech: { create } } },
      input: "hello",
      voice: "coral",
      signal: new AbortController().signal,
      guildId: "guild",
      userId: "user",
      log,
      sleep: jest.fn(),
    }),
  ).resolves.toEqual({ failed: true });

  expect(create).toHaveBeenCalledTimes(1);
  expect(log.error).toHaveBeenCalledWith("OpenAI TTS request error", error);
});

test("stops retries when the request signal aborts", async () => {
  const controller = new AbortController();
  const create = jest.fn(() => {
    controller.abort();
    throw new Error("aborted");
  });
  const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };

  await expect(
    requestSpeech({
      client: { audio: { speech: { create } } },
      input: "hello",
      voice: "coral",
      signal: controller.signal,
      guildId: "guild",
      userId: "user",
      log,
      sleep: jest.fn(),
    }),
  ).resolves.toEqual({ aborted: true });

  expect(create).toHaveBeenCalledTimes(1);
  expect(log.debug).toHaveBeenCalledWith("OpenAI TTS request aborted", {
    guildId: "guild",
    userId: "user",
  });
});

test("returns a handled failure when the retry delay rejects", async () => {
  const requestError = { status: 429 };
  const delayError = new Error("delay failed");
  const create = jest.fn().mockRejectedValue(requestError);
  const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };
  await expect(
    requestSpeech({
      client: { audio: { speech: { create } } },
      input: "hello",
      voice: "coral",
      signal: new AbortController().signal,
      guildId: "guild",
      userId: "user",
      log,
      sleep: jest.fn().mockRejectedValue(delayError),
    }),
  ).resolves.toEqual({ failed: true });
  expect(log.error).toHaveBeenCalledWith("OpenAI TTS retry delay failed", delayError);
  expect(create).toHaveBeenCalledTimes(1);
});
