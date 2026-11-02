import { expect, test } from "@jest/globals";
import { recordSpeechResponseTiming } from "../../../src/audio/response/timing.mjs";

test("stores the response arrival time", () => {
  const metrics = {};
  expect(recordSpeechResponseTiming(metrics, () => 42)).toBe(42);
  expect(metrics.responseReceivedAt).toBe(42);
});
