import { describe, expect, jest, test } from "@jest/globals";
import { stopGuildPlayer } from "../../src/tts/player-control.mjs";

describe("guild player control", () => {
  test("stops the player and cancels current playback", () => {
    const current = { controller: { abort: jest.fn() } };
    const state = { current, player: { stop: jest.fn() } };
    stopGuildPlayer(state);
    expect(state.player.stop).toHaveBeenCalledWith(true);
    expect(current.controller.abort).toHaveBeenCalled();
    expect(state.current).toBeNull();
  });
});
