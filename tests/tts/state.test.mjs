import { describe, expect, test } from "@jest/globals";
import { ensureGuildState } from "../../src/tts/state.mjs";

describe("guild state", () => {
  test("creates and reuses the state for a guild", () => {
    const guildId = `state-test-${process.pid}`;
    const first = ensureGuildState(guildId);
    const second = ensureGuildState(guildId);
    expect(second).toBe(first);
    expect(first).toMatchObject({
      connection: null,
      queue: [],
      playing: false,
      linkedTextChannelId: null,
      current: null,
    });
    expect(first.player).toBeDefined();
  });
});
