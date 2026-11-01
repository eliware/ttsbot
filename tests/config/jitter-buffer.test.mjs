import { describe, expect, test } from '@jest/globals';
import { parseJitterBufferMs } from '../../src/jitterBuffer.mjs';

describe('jitter buffer configuration', () => {
  test('parses and clamps the configured delay', () => {
    expect(parseJitterBufferMs()).toBe(200);
    expect(parseJitterBufferMs('0')).toBe(0);
    expect(parseJitterBufferMs('500')).toBe(500);
    expect(parseJitterBufferMs('5000')).toBe(1000);
    expect(parseJitterBufferMs('-1')).toBe(0);
    expect(parseJitterBufferMs('invalid')).toBe(0);
  });
});
