import { describe, expect, jest, test } from '@jest/globals';
import { createSkipAction } from '../../src/tts/skip.mjs';

describe('skip action', () => {
  test('stops the player and cancels current audio', async () => {
    const current = { controller: { abort: jest.fn() } };
    const state = { queue: [], current, player: { state: { status: 'playing' }, stop: jest.fn() } };
    const skip = createSkipAction({ getGuildState: () => state, log: { debug: jest.fn() } });
    await skip('guild');
    expect(state.player.stop).toHaveBeenCalledWith(true);
    expect(current.controller.abort).toHaveBeenCalled();
    expect(state.current).toBeNull();
  });
});
