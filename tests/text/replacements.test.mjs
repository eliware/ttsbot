import { describe, expect, jest, test } from '@jest/globals';
import {
  applyReplacements,
  compileReplacements,
  createReplacementLoader,
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

  test('loads replacement rules once and reuses the cache', async () => {
    const readFile = jest.fn(async () => JSON.stringify([{ search: 'brb', replace: 'be right back' }]));
    const loadReplacements = createReplacementLoader({ readFile, filePath: 'replacements.json' });

    const first = await loadReplacements();
    const second = await loadReplacements();

    expect(second).toBe(first);
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith('replacements.json', 'utf8');
  });

  test.each([
    ['read failure', jest.fn(async () => { throw new Error('read failed'); })],
    ['invalid JSON', jest.fn(async () => '{')],
    ['invalid entries', jest.fn(async () => '[null]')],
  ])('uses an empty cached list after %s', async (_name, readFile) => {
    const loadReplacements = createReplacementLoader({ readFile });

    const first = await loadReplacements();
    const second = await loadReplacements();

    expect(first).toEqual([]);
    expect(second).toBe(first);
    expect(readFile).toHaveBeenCalledTimes(1);
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
