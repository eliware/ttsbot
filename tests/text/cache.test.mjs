import { describe, expect, jest, test } from '@jest/globals';
import { createCachedLoader } from '../../src/text/cache.mjs';

describe('cached loader', () => {
  test('loads a value once and reuses it', async () => {
    const value = [{ regex: /brb/gi, replace: 'back' }];
    const load = jest.fn(async () => value);
    const cachedLoad = createCachedLoader(load);
    expect(await cachedLoad()).toBe(value);
    expect(await cachedLoad()).toBe(value);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
