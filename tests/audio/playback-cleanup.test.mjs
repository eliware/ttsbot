import { describe, expect, jest, test } from '@jest/globals';
import { cleanupPlayback } from '../../src/audio/playback-cleanup.mjs';

describe('playback cleanup', () => {
  test('destroys playback resources and clears the matching current item', () => {
    const current = {
      controller: { abort: jest.fn() },
      source: { destroy: jest.fn() },
      resampler: { destroy: jest.fn() },
      jitterBuffer: { destroy: jest.fn() },
    };
    const responseBody = { destroy: jest.fn() };
    const state = { current };
    cleanupPlayback({ state, current, responseBody });
    expect(current.controller.abort).not.toHaveBeenCalled();
    expect(current.source.destroy).toHaveBeenCalled();
    expect(current.resampler.destroy).toHaveBeenCalled();
    expect(current.jitterBuffer.destroy).toHaveBeenCalled();
    expect(responseBody.destroy).toHaveBeenCalled();
    expect(state.current).toBeNull();
  });

  test('preserves a newer current playback item', () => {
    const current = { source: { destroy: jest.fn() } };
    const newer = {};
    const state = { current: newer };
    cleanupPlayback({ state, current });
    expect(state.current).toBe(newer);
  });
});
