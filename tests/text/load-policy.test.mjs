import { describe, expect, test } from '@jest/globals';
import { createReplacementLoadPolicy } from '../../src/text/load-policy.mjs';

describe('replacement load policy', () => {
  test.each([
    ['read failure', async () => { throw new Error('read failed'); }],
    ['invalid JSON', async () => '{'],
    ['invalid entries', async () => '[null]'],
  ])('returns no rules after %s', async (_label, readReplacements) => {
    await expect(createReplacementLoadPolicy({ readReplacements })()).resolves.toEqual([]);
  });
});
