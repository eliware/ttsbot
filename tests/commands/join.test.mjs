import { expect, jest, test } from "@jest/globals";
import join from "../../src/commands/join.mjs";

test("dispatches the join action", async () => {
  const interaction = {};
  const actions = { join: jest.fn() };
  await join({ actions }, interaction);
  expect(actions.join).toHaveBeenCalledWith(interaction);
});
