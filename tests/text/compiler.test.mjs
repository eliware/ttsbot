import { describe, expect, test } from '@jest/globals';
import { compileReplacements } from '../../src/text/compiler.mjs';

describe('replacement compiler', () => {
  test('compiles escaped whole-word rules without regard to case', () => {
    const replacements = compileReplacements([
      { search: 'lol', replace: 'laugh out loud' }, { search: 'a+b', replace: 'sum' },
    ]);
    expect(replacements[0].regex.test('LOL')).toBe(true);
    expect(replacements[0].regex.test('lolly')).toBe(false);
    expect(replacements[1].regex.test('a+b')).toBe(true);
    expect(replacements[1].regex.test('aab')).toBe(false);
  });

  test('compiles an empty entry list', () => {
    expect(compileReplacements([])).toEqual([]);
  });
});
