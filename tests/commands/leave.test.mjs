import { expect, jest, test } from "@jest/globals";
import leave from "../../src/commands/leave.mjs";

test("dispatches the leave action", async () => {
  const interaction = {};
  const actions = { leave: jest.fn() };
  await leave({ actions }, interaction);
  expect(actions.leave).toHaveBeenCalledWith(interaction);
});
