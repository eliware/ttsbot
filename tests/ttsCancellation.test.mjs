import { describe, expect, jest, test } from '@jest/globals';
import { cancelCurrent } from '../src/audioLifecycle.mjs';

describe('TTS cancellation', () => {
  test('skip/stop cancellation aborts and destroys the current pipeline', () => {
    const state = {
      current: {
        controller: { abort: jest.fn() },
        source: { destroy: jest.fn() },
        resampler: { destroy: jest.fn() },
        jitterBuffer: { destroy: jest.fn() },
      },
    };

    const current = state.current;
    cancelCurrent(state);

    expect(current.controller.abort).toHaveBeenCalledTimes(1);
    expect(current.source.destroy).toHaveBeenCalledTimes(1);
    expect(current.resampler.destroy).toHaveBeenCalledTimes(1);
    expect(current.jitterBuffer.destroy).toHaveBeenCalledTimes(1);
    expect(state.current).toBeNull();
  });

  test('cancellation is safe when nothing is playing', () => {
    const state = { current: null };
    expect(() => cancelCurrent(state)).not.toThrow();
  });
});
