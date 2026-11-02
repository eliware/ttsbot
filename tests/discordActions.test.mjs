import { expect, jest, test } from "@jest/globals";
import { AVAILABLE_VOICES, createDiscordActions } from "../src/discordActions.mjs";

test("builds the command action set and exports available voices", () => {
  const actions = createDiscordActions({
    log: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
  });
  expect(Object.keys(actions).sort()).toEqual(["join", "leave", "skip", "stop", "voice"]);
  expect(AVAILABLE_VOICES).toContain("coral");
});
