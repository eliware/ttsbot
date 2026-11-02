import { expect, jest, test } from "@jest/globals";
import clientReady from "../../src/events/clientReady.mjs";

test("logs the Discord client tag after login", async () => {
  const log = { info: jest.fn() };
  await clientReady({ log }, { user: { tag: "tts bot#7717" } });
  expect(log.info).toHaveBeenCalledWith("Discord client ready", { tag: "tts bot#7717" });
});
