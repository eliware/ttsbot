import { expect, jest, test } from "@jest/globals";
import { logIgnoredInteraction } from "../../../events/interaction-log/ignored.mjs";

test("logs ignored interactions", () => {
  const log = { debug: jest.fn() };
  logIgnoredInteraction(log, { type: 3, customId: "x" });
  expect(log.debug).toHaveBeenCalledWith("Ignoring non-command interaction", {
    type: 3,
    customId: "x",
  });
});
