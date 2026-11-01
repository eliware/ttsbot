import { expect, jest, test } from "@jest/globals";
import { logReceivedInteraction } from "../../../events/interaction-log/received.mjs";

test("logs received command details", () => {
  const log = { debug: jest.fn() };
  logReceivedInteraction(log, {
    guildId: "g",
    channelId: "c",
    user: { id: "u" },
    commandName: "join",
  });
  expect(log.debug).toHaveBeenCalledWith("Discord command received", {
    guildId: "g",
    channelId: "c",
    userId: "u",
    command: "join",
  });
});
