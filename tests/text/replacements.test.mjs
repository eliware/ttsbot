import { describe, expect, jest, test } from '@jest/globals';
import {
  applyReplacements,
  compileReplacements,
} from '../../src/text/replacements.mjs';
import { createTextReplacer } from '../../src/text/replacer.mjs';

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

});
