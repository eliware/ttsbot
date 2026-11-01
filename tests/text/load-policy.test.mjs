import { describe, expect, jest, test } from '@jest/globals';
import { createReplacementLoadPolicy } from '../../src/text/load-policy.mjs';

describe('replacement load policy', () => {
  test('compiles data returned by the reader', async () => {
    const readReplacements = jest.fn(async () => '[{"search":"brb","replace":"back"}]');
    const loadReplacementRules = createReplacementLoadPolicy({ readReplacements });
    const rules = await loadReplacementRules();
    expect(rules[0].regex.test('brb')).toBe(true);
    expect(readReplacements).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['read failure', async () => { throw new Error('read failed'); }],
    ['invalid JSON', async () => '{'],
    ['invalid entries', async () => '[null]'],
  ])('returns no rules after %s', async (_label, readReplacements) => {
    await expect(createReplacementLoadPolicy({ readReplacements })()).resolves.toEqual([]);
  });
});
