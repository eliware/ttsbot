import { expect, jest, test } from "@jest/globals";
import { assignMessageVoice } from "../../../src/discord/message/voice.mjs";

test("logs assignment failures without interrupting message handling", async () => {
  const error = new Error("assignment failed");
  const log = { error: jest.fn() };
  await expect(
    assignMessageVoice({
      assignVoice: async () => {
        throw error;
      },
      guildId: "g",
      userId: "u",
      state: {},
      log,
    }),
  ).resolves.toBeUndefined();
  expect(log.error).toHaveBeenCalledWith("Failed to assign user voice", error);
});
