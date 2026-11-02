import { expect, jest, test } from "@jest/globals";
import help from "../../src/commands/help.mjs";

test("replies with command help and records the invocation", async () => {
  const reply = jest.fn();
  const log = { debug: jest.fn() };
  await help({ log }, { reply });
  expect(reply).toHaveBeenCalledWith(
    expect.objectContaining({ content: expect.stringContaining("/join"), flags: 64 }),
  );
  expect(log.debug).toHaveBeenCalledWith("help command handled");
});
