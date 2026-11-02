import { expect, jest, test } from "@jest/globals";
import { logCompletedInteraction } from "../../../src/discord/interaction-log/completed.mjs";

test("logs completed commands", () => {
  const log = { debug: jest.fn() };
  logCompletedInteraction(log, { guildId: "g", user: { id: "u" }, commandName: "join" });
  expect(log.debug).toHaveBeenCalledWith("Discord command completed", {
    guildId: "g",
    userId: "u",
    command: "join",
  });
});
