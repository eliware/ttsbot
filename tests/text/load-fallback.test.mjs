import { describe, expect, test } from '@jest/globals';
import { createReplacementLoadFallback } from '../../src/text/load-fallback.mjs';

describe('replacement load fallback', () => {
  test.each([
    ['read failure', async () => { throw new Error('read failed'); }],
    ['invalid JSON', async () => '{'],
    ['invalid entries', async () => '[null]'],
  ])('returns no rules after %s', async (_label, readReplacements) => {
    await expect(createReplacementLoadFallback({ readReplacements })()).resolves.toEqual([]);
  });
});
