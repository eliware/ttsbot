import { describe, expect, jest, test } from '@jest/globals';
import { createStopAction } from '../../src/tts/stop.mjs';

describe('stop action', () => {
  test('clears the queue, stops the player, and cancels current audio', async () => {
    const current = { controller: { abort: jest.fn() } };
    const state = { queue: [{ text: 'queued' }], current, player: { state: { status: 'playing' }, stop: jest.fn() } };
    const stop = createStopAction({ getGuildState: () => state, log: { debug: jest.fn() } });
    await stop('guild');
    expect(state.queue).toEqual([]);
    expect(state.player.stop).toHaveBeenCalledWith(true);
    expect(current.controller.abort).toHaveBeenCalled();
  });
});
