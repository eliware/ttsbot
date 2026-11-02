import { describe, expect, jest, test } from "@jest/globals";
import { cleanupPlayback } from "../../../src/audio/playback/cleanup.mjs";

describe("playback cleanup", () => {
  test("preserves a newer current playback item", () => {
    const current = { source: { destroy: jest.fn() } };
    const newer = {};
    const state = { current: newer };
    cleanupPlayback({ state, current });
    expect(state.current).toBe(newer);
  });
});
