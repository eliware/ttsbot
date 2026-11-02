import { expect, jest, test } from "@jest/globals";
import { cleanupGuildAudio, stopGuildAudio } from "../../src/application/audio-cleanup.mjs";

test("stops guild audio and destroys its voice connection", async () => {
  const connection = { destroy: jest.fn() };
  const state = { connection };
  const stopAndClear = jest.fn();
  await cleanupGuildAudio({
    client: { guilds: { cache: new Map([["g", {}]]) } },
    stopAndClear,
    getVoiceConnection: () => connection,
    ensureGuildState: () => state,
    log: { error: jest.fn() },
  });
  expect(stopAndClear).toHaveBeenCalledWith("g");
  expect(connection.destroy).toHaveBeenCalled();
  expect(state.connection).toBeNull();
});

test("logs a failed audio stop and continues cleanup", async () => {
  const error = new Error("stop failed");
  const log = { error: jest.fn() };
  await expect(
    stopGuildAudio({
      guildId: "g",
      stopAndClear: async () => {
        throw error;
      },
      log,
    }),
  ).resolves.toBeUndefined();
  expect(log.error).toHaveBeenCalledWith("Failed to stop guild audio", error);
});
