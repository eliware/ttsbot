import { describe, expect, jest, test } from '@jest/globals';
import { createQueueActions } from '../../src/tts/queue-control.mjs';

describe('TTS queue actions', () => {
  test('stops the player when skipping current audio', async () => {
    const state = { queue: [], current: null, player: { state: { status: 'playing' }, stop: jest.fn() } };
    const actions = createQueueActions({ getGuildState: () => state, log: { debug: jest.fn() } });
    await actions.skipCurrent('guild');
    expect(state.player.stop).toHaveBeenCalledWith(true);
  });

  test('clears the queue and stops the player', async () => {
    const state = { queue: [{ text: 'queued' }], current: null, player: { state: { status: 'playing' }, stop: jest.fn() } };
    const actions = createQueueActions({ getGuildState: () => state, log: { debug: jest.fn() } });
    await actions.stopAndClear('guild');
    expect(state.queue).toEqual([]);
    expect(state.player.stop).toHaveBeenCalledWith(true);
  });
});
