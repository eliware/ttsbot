import { describe, expect, test } from '@jest/globals';
import { parseReplacementEntries } from '../../src/text/json-loader.mjs';

describe('replacement JSON loader', () => {
  test('parses replacement entries', () => {
    expect(parseReplacementEntries('[{"search":"brb","replace":"back"}]')).toEqual([
      { search: 'brb', replace: 'back' },
    ]);
  });

  test('returns an empty list for empty input', () => {
    expect(parseReplacementEntries('')).toEqual([]);
  });
});
