import { describe, expect, jest, test } from '@jest/globals';
import { createQueueProcessor } from '../../src/tts/processor.mjs';

describe('TTS queue processor recovery', () => {
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
