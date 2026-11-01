import { describe, expect, jest, test } from '@jest/globals';
import { cleanupCurrent } from '../../src/audioLifecycle.mjs';

describe('audio lifecycle cleanup', () => {
  test('cleans the playback pipeline and response body without aborting', () => {
    const current = {
      controller: { abort: jest.fn() },
      source: { destroy: jest.fn() },
      resampler: { destroy: jest.fn() },
      jitterBuffer: { destroy: jest.fn() },
    };
    const responseBody = { destroy: jest.fn() };
    cleanupCurrent(current, { responseBody, abort: false });
    expect(current.controller.abort).not.toHaveBeenCalled();
    expect(current.source.destroy).toHaveBeenCalled();
    expect(current.resampler.destroy).toHaveBeenCalled();
    expect(current.jitterBuffer.destroy).toHaveBeenCalled();
    expect(responseBody.destroy).toHaveBeenCalled();
  });

  test('continues cleanup when a resource destroy call fails', () => {
    const current = {
      controller: { abort: jest.fn() },
      source: { destroy: () => { throw new Error('source failed'); } },
      resampler: { destroy: () => { throw new Error('resampler failed'); } },
      jitterBuffer: { destroy: jest.fn() },
    };
    const responseBody = { destroy: () => { throw new Error('body failed'); } };
    expect(() => cleanupCurrent(current, { responseBody, abort: false })).not.toThrow();
    expect(current.jitterBuffer.destroy).toHaveBeenCalled();
  });

  test('cancels a response body that has no destroy method', () => {
    const responseBody = { cancel: jest.fn() };
    cleanupCurrent({}, { responseBody, abort: false });
    expect(responseBody.cancel).toHaveBeenCalled();
  });
});
