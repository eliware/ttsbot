import { describe, expect, test } from '@jest/globals';
import { shouldLogBufferUnderrun } from '../src/ttsPolicies.mjs';

describe('buffer underrun detection', () => {
  test('only reports buffering after playback has started', () => {
    expect(shouldLogBufferUnderrun(false)).toBe(false);
    expect(shouldLogBufferUnderrun(undefined)).toBe(false);
    expect(shouldLogBufferUnderrun(true)).toBe(true);
  });
});
