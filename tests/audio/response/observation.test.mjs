import { expect, jest, test } from "@jest/globals";
import { observeSpeechResponse } from "../../../src/audio/response/observation.mjs";

test("records metrics when a response arrives", () => {
  const metrics = { requestStartedAt: 10 };
  const log = { debug: jest.fn() };
  observeSpeechResponse({
    metrics,
    now: () => 25,
    receivedAt: 20,
    guildId: "g",
    userId: "u",
    hasBody: true,
    log,
  });
  expect(metrics.responseReceivedAt).toBe(25);
  expect(log.debug).toHaveBeenCalled();
});
