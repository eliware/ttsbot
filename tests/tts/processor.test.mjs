import { describe, expect, jest, test } from '@jest/globals';
import { createQueueProcessor } from '../../src/tts/processor.mjs';

describe('TTS queue processor', () => {
  test('plays queued jobs in order and clears the playing flag', async () => {
    const state = { queue: [
      { text: 'first', userId: 'one', userTag: 'one#1', receivedAt: 1 },
      { text: 'second', userId: 'two', userTag: 'two#1' },
    ], playing: false };
    const playText = jest.fn(async () => {});
    const processQueue = createQueueProcessor({ getGuildState: () => state, playText, log: { debug: jest.fn(), error: jest.fn() } });
    await processQueue('guild');
    expect(playText).toHaveBeenNthCalledWith(1, 'guild', 'first', 'one', 'one#1', 1, state);
    expect(playText).toHaveBeenNthCalledWith(2, 'guild', 'second', 'two', 'two#1', undefined, state);
    expect(state).toMatchObject({ queue: [], playing: false });
  });

  test('does not start a second processor and continues after playback errors', async () => {
    const busy = { queue: [{ text: 'pending' }], playing: true };
    const playText = jest.fn();
    await createQueueProcessor({ getGuildState: () => busy, playText })( 'guild');
    expect(playText).not.toHaveBeenCalled();

    const state = { queue: [{ text: 'bad' }, { text: 'good' }], playing: false };
    const error = new Error('playback failed');
    const logger = { debug: jest.fn(), error: jest.fn() };
    const recover = jest.fn().mockRejectedValueOnce(error).mockResolvedValueOnce(undefined);
    await createQueueProcessor({ getGuildState: () => state, playText: recover, log: logger })('guild');
    expect(recover).toHaveBeenCalledTimes(2);
    expect(logger.error).toHaveBeenCalledWith('Error playing TTS:', error);
    expect(state.playing).toBe(false);
  });

});

describe('TTS queue processor error handling', () => {
  test('resets playing when error logging throws during recovery', async () => {
    const state = { queue: [{ text: 'bad' }], playing: false };
    const processQueue = createQueueProcessor({
      getGuildState: () => state,
      playText: async () => { throw new Error('playback failed'); },
      log: { debug: jest.fn(), error: () => { throw new Error('logger failed'); } },
    });
    await expect(processQueue('guild')).rejects.toThrow('logger failed');
    expect(state.playing).toBe(false);
  });
});
