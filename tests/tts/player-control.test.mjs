import { describe, expect, jest, test } from "@jest/globals";
import { stopGuildPlayer } from "../../src/tts/player-control.mjs";

describe("guild player control", () => {
  test("cancels playback when the guild has no player", () => {
    const state = { current: { controller: { abort: jest.fn() } } };
    stopGuildPlayer(state);
    expect(state.current).toBeNull();
  });

  test("stops the player and cancels current playback", () => {
    const current = { controller: { abort: jest.fn() } };
    const state = { current, player: { stop: jest.fn() } };
    stopGuildPlayer(state);
    expect(state.player.stop).toHaveBeenCalledWith(true);
    expect(current.controller.abort).toHaveBeenCalled();
    expect(state.current).toBeNull();
  });
});
