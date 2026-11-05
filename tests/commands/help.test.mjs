import { expect, jest, test } from "@jest/globals";
import help from "../../src/commands/help.mjs";

test("replies with command help and records the invocation", async () => {
  const reply = jest.fn();
  const log = { debug: jest.fn() };
  const msg = jest.fn((_locale, _key, defaultMessage) => defaultMessage);
  await help({ log, msg }, { locale: "en-US", reply });
  expect(msg).toHaveBeenCalledWith("en-US", "help", expect.any(String));
  expect(reply).toHaveBeenCalledWith(
    expect.objectContaining({ content: expect.stringContaining("/join"), flags: 64 }),
  );
  expect(log.debug).toHaveBeenCalledWith("help command handled");
});
