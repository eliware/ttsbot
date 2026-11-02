import { expect, jest, test } from "@jest/globals";
import { destroyGuildVoiceConnection } from "../../src/application/voice-cleanup.mjs";

test("destroys a voice connection and clears stored state", () => {
  const connection = { destroy: jest.fn() };
  const state = { connection };
  destroyGuildVoiceConnection({
    guildId: "g",
    getVoiceConnection: () => connection,
    ensureGuildState: () => state,
    log: { error: jest.fn() },
  });
  expect(connection.destroy).toHaveBeenCalled();
  expect(state.connection).toBeNull();
});

test("logs connection and state cleanup failures independently", () => {
  const connectionError = new Error("destroy failed");
  const stateError = new Error("state failed");
  const log = { error: jest.fn() };
  destroyGuildVoiceConnection({
    guildId: "g",
    getVoiceConnection: () => ({
      destroy() {
        throw connectionError;
      },
    }),
    ensureGuildState() {
      throw stateError;
    },
    log,
  });
  expect(log.error).toHaveBeenNthCalledWith(
    1,
    "Failed to destroy voice connection",
    connectionError,
  );
  expect(log.error).toHaveBeenNthCalledWith(2, "Failed to clear guild voice state", stateError);
});
