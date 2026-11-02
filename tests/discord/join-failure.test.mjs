import { expect, jest, test } from "@jest/globals";
import { handleJoinFailure } from "../../src/discord/join-failure.mjs";

test("destroys the failed connection, clears state, and reports the error", async () => {
  const error = new Error("connection failed");
  const connection = { destroy: jest.fn() };
  const state = { connection, linkedTextChannelId: "text" };
  const interaction = { editReply: jest.fn() };
  const log = { error: jest.fn() };
  await handleJoinFailure({ error, connection, state, interaction, log });
  expect(log.error).toHaveBeenCalledWith("Voice connection failed", error);
  expect(connection.destroy).toHaveBeenCalled();
  expect(state).toMatchObject({ connection: null, linkedTextChannelId: null });
  expect(interaction.editReply).toHaveBeenCalledWith({
    content: "Failed to connect to the voice channel. Please try /join again.",
  });
});
