import { expect, jest, test } from "@jest/globals";
import voice from "../../src/commands/voice.mjs";

test("dispatches the selected voice", async () => {
  const interaction = { options: { getString: jest.fn(() => "coral") } };
  const actions = { voice: jest.fn() };
  await voice({ actions }, interaction);
  expect(interaction.options.getString).toHaveBeenCalledWith("voice", true);
  expect(actions.voice).toHaveBeenCalledWith(interaction, "coral");
});
