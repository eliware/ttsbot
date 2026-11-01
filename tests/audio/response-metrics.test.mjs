import { describe, expect, jest, test } from "@jest/globals";
import { observeSpeechResponse } from "../../src/audio/response-observation.mjs";

describe("speech response metrics", () => {
  test("records response timing", () => {
    const metrics = { requestStartedAt: 10 };
    const log = { debug: jest.fn() };
    observeSpeechResponse({
      metrics,
      now: () => 30,
      receivedAt: 20,
      guildId: "g",
      userId: "u",
      hasBody: true,
      log,
    });
    expect(metrics.responseReceivedAt).toBe(30);
    expect(log.debug).toHaveBeenCalledWith("OpenAI TTS response received", {
      guildId: "g",
      userId: "u",
      hasBody: true,
      requestMs: 20,
      discordToOpenAIResponseMs: 10,
    });
  });
});
