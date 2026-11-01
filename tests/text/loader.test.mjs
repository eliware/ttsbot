import { describe, expect, jest, test } from '@jest/globals';
import { createReplacementLoader } from '../../src/text/loader.mjs';

describe('replacement loader', () => {
  test('caches values returned by the load policy', async () => {
    const rules = [{ regex: /brb/gi, replace: 'back' }];
    const loadReplacementRules = jest.fn(async () => rules);
    const loadReplacements = createReplacementLoader({ loadReplacementRules });
    expect(await loadReplacements()).toBe(rules);
    expect(await loadReplacements()).toBe(rules);
    expect(loadReplacementRules).toHaveBeenCalledTimes(1);
  });

  test('loads replacement rules once and reuses the cache', async () => {
    const readReplacements = jest.fn(async () => JSON.stringify([{ search: 'brb', replace: 'be right back' }]));
    const loadReplacements = createReplacementLoader({ readReplacements });
    const first = await loadReplacements();
    const second = await loadReplacements();
    expect(second).toBe(first);
    expect(readReplacements).toHaveBeenCalledTimes(1);
  });

});
