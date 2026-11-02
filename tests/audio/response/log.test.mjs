import { expect, jest, test } from "@jest/globals";
import { logSpeechResponse } from "../../../src/audio/response/log.mjs";

test("logs response timing with and without a Discord receive time", () => {
  const log = { debug: jest.fn() };
  const metrics = { requestStartedAt: 10, responseReceivedAt: 30 };
  logSpeechResponse({ log, metrics, receivedAt: 20, guildId: "g", userId: "u", hasBody: true });
  logSpeechResponse({ log, metrics, receivedAt: null, guildId: "g", userId: "u", hasBody: false });
  expect(log.debug).toHaveBeenNthCalledWith(1, "OpenAI TTS response received", {
    guildId: "g",
    userId: "u",
    hasBody: true,
    requestMs: 20,
    discordToOpenAIResponseMs: 10,
  });
  expect(log.debug.mock.calls[1][1].discordToOpenAIResponseMs).toBeUndefined();
});
