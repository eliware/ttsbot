import { expect, jest, test } from "@jest/globals";
import { createLeaveAction } from "../../src/discord/leave.mjs";

test("reports when there is no voice connection", async () => {
  const interaction = { guildId: "g", user: { id: "u" }, reply: jest.fn() };
  const leave = createLeaveAction({
    log: { debug: jest.fn() },
    getConnection: () => null,
    getGuildState: async () => ({}),
    stopAndClear: jest.fn(),
  });
  await leave(interaction);
  expect(interaction.reply).toHaveBeenCalledWith({
    content: "I am not in a voice channel.",
    flags: 64,
  });
});

test("uses default state and stop handlers for a connected voice session", async () => {
  const connection = { destroy: jest.fn() };
  const interaction = {
    guildId: "default-leave-guild",
    user: { id: "u" },
    reply: jest.fn(async () => {}),
  };
  await createLeaveAction({
    log: { debug: jest.fn() },
    getConnection: () => connection,
  })(interaction);
  expect(connection.destroy).toHaveBeenCalledTimes(1);
  expect(interaction.reply).toHaveBeenCalledWith("Left the voice channel and cleared state.");
});
