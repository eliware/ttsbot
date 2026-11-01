import { describe, expect, jest, test } from '@jest/globals';
import {
  applyReplacements,
  compileReplacements,
  createTextReplacer,
} from '../../src/text/replacements.mjs';

describe('text replacements', () => {
  test('matches whole words without regard to case and escapes patterns', () => {
    const replacements = compileReplacements(JSON.stringify([
      { search: 'lol', replace: 'laugh out loud' },
      { search: 'a+b', replace: 'sum' },
    ]));

    expect(applyReplacements('LOL lolly a+b aab', replacements)).toBe('laugh out loud lolly sum aab');
  });

  test('uses an empty replacement list for empty input', () => {
    expect(compileReplacements('')).toEqual([]);
    expect(applyReplacements('hello', [])).toBe('hello');
  });

  test('preserves input and logs when replacement processing fails', async () => {
    const error = new Error('replacement load failed');
    const logger = { error: jest.fn() };
    const replaceText = createTextReplacer({
      loadReplacements: async () => { throw error; },
      logger,
    });

    await expect(replaceText('text')).resolves.toBe('text');
    expect(logger.error).toHaveBeenCalledWith('Replacements error', error);
  });
});
