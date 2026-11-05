import { expect, jest, test } from "@jest/globals";
import { cancelAbortedSpeechResponse } from "../../../src/audio/response/cancellation.mjs";

test("keeps a response when its signal is active", () => {
  const cancel = jest.fn();
  const log = { debug: jest.fn() };
  expect(
    cancelAbortedSpeechResponse({
      response: { body: { cancel } },
      signal: { aborted: false },
      guildId: "guild",
      userId: "user",
      log,
    }),
  ).toBe(false);
  expect(cancel).not.toHaveBeenCalled();
  expect(log.debug).not.toHaveBeenCalled();
});

test("cancels an aborted response body", () => {
  const cancel = jest.fn();
  const log = { debug: jest.fn() };
  expect(
    cancelAbortedSpeechResponse({
      response: { body: { cancel } },
      signal: { aborted: true },
      guildId: "guild",
      userId: "user",
      log,
    }),
  ).toBe(true);
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(log.debug).toHaveBeenCalledWith("Discarding canceled OpenAI TTS response", {
    guildId: "guild",
    userId: "user",
  });
});

test("handles an aborted response without a body", () => {
  const log = { debug: jest.fn() };
  expect(
    cancelAbortedSpeechResponse({
      signal: { aborted: true },
      guildId: "guild",
      userId: "user",
      log,
    }),
  ).toBe(true);
  expect(log.debug).toHaveBeenCalledTimes(1);
});
