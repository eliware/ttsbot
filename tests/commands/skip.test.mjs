import { expect, jest, test } from "@jest/globals";
import skip from "../../src/commands/skip.mjs";

test("dispatches the skip action", async () => {
  const interaction = {};
  const actions = { skip: jest.fn() };
  await skip({ actions }, interaction);
  expect(actions.skip).toHaveBeenCalledWith(interaction);
});
