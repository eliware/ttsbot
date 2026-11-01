import { describe, expect, test } from '@jest/globals';
import { formatNodeWarning } from '../../src/warnings/formatter.mjs';

describe('Node warning formatter', () => {
  test('formats warnings with and without codes', () => {
    expect(formatNodeWarning({ name: 'Warning', code: 'OTHER', message: 'details' })).toBe('Warning (OTHER): details');
    expect(formatNodeWarning({ name: 'Warning', message: 'details' })).toBe('Warning: details');
  });
});
