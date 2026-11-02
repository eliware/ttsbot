import { expect, jest, test } from "@jest/globals";
import { logUnknownInteractionCommand } from "../../../src/discord/interaction-log/unknown.mjs";

test("warns about unknown commands", () => {
  const log = { warn: jest.fn() };
  logUnknownInteractionCommand(log, { commandName: "missing" });
  expect(log.warn).toHaveBeenCalledWith("Unknown Discord command", { command: "missing" });
});
