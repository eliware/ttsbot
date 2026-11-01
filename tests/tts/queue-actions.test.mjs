import { describe, expect, jest, test } from '@jest/globals';
import { createQueueActions } from '../../src/tts/queue-actions.mjs';

describe('TTS queue actions', () => {
  test('skips and cancels the current audio', async () => {
    const current = { controller: { abort: jest.fn() } };
    const state = { queue: [], current, player: { state: { status: 'playing' }, stop: jest.fn() } };
    const actions = createQueueActions({ getGuildState: () => state, log: { debug: jest.fn() } });
    await actions.skipCurrent('guild');
    expect(state.player.stop).toHaveBeenCalledWith(true);
    expect(current.controller.abort).toHaveBeenCalled();
    expect(state.current).toBeNull();
  });

  test('clears the queue, stops the player, and cancels current audio', async () => {
    const current = { controller: { abort: jest.fn() } };
    const state = { queue: [{ text: 'queued' }], current, player: { state: { status: 'playing' }, stop: jest.fn() } };
    const actions = createQueueActions({ getGuildState: () => state, log: { debug: jest.fn() } });
    await actions.stopAndClear('guild');
    expect(state.queue).toEqual([]);
    expect(state.player.stop).toHaveBeenCalledWith(true);
    expect(current.controller.abort).toHaveBeenCalled();
  });
});
