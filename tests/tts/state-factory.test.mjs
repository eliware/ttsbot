import { describe, expect, jest, test } from "@jest/globals";
import { createGuildState } from "../../src/tts/state-factory.mjs";

describe("guild state factory", () => {
  test("creates initial guild state with an audio player", () => {
    const player = {};
    const createPlayer = jest.fn(() => player);
    const state = createGuildState({ guildId: "guild", createPlayer });
    expect(createPlayer).toHaveBeenCalledWith({ guildId: "guild" });
    expect(state).toEqual({
      connection: null,
      player,
      queue: [],
      playing: false,
      linkedTextChannelId: null,
      current: null,
    });
  });
});
