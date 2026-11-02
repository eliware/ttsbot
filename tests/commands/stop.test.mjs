import { expect, jest, test } from "@jest/globals";
import stop from "../../src/commands/stop.mjs";

test("dispatches the stop action", async () => {
  const interaction = {};
  const actions = { stop: jest.fn() };
  await stop({ actions }, interaction);
  expect(actions.stop).toHaveBeenCalledWith(interaction);
});
