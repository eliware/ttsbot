import { describe, expect, jest, test } from "@jest/globals";
import { logPlaybackStarted, logPlaybackIdle } from "../../src/audio/playback-metrics.mjs";

describe("playback metrics", () => {
  test("records and logs playback start once", () => {
    const metrics = { requestStartedAt: 10 };
    const log = { debug: jest.fn() };
    const now = jest.fn(() => 30);
    const options = { metrics, receivedAt: 20, guildId: "g", userId: "u", log, now };
    expect(logPlaybackStarted(options)).toBe(true);
    expect(logPlaybackStarted(options)).toBe(false);
    expect(metrics.playbackFirstByteAt).toBe(30);
    expect(log.debug).toHaveBeenCalledTimes(1);
  });

  test("records and logs playback idle timing and byte count", () => {
    const metrics = { requestStartedAt: 10, openaiFirstByteAt: 15 };
    const log = { debug: jest.fn() };
    logPlaybackIdle({
      metrics,
      getAudioBytes: () => 4,
      guildId: "g",
      userId: "u",
      log,
      now: () => 30,
    });
    expect(metrics.playbackIdleAt).toBe(30);
    expect(log.debug).toHaveBeenCalledWith(
      "Discord TTS playback idle",
      expect.objectContaining({ audioBytes: 4, playbackTotalMs: 20, openaiToPlaybackIdleMs: 15 }),
    );
  });
});
