import { expect, jest, test } from "@jest/globals";
import { requestSpeech } from "../../src/audio/retry.mjs";

test("returns the first successful speech response", async () => {
  const response = { body: Buffer.from("audio") };
  const create = jest.fn(async () => response);
  const result = await requestSpeech({
    client: { audio: { speech: { create } } },
    input: "hello",
    voice: "coral",
    signal: new AbortController().signal,
    guildId: "g",
    userId: "u",
    log: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
    sleep: async () => {},
  });
  expect(result).toEqual({ response });
  expect(create).toHaveBeenCalledTimes(1);
});
