import { describe, expect, jest, test } from '@jest/globals';
import { createTextReplacer } from '../../src/text/replacer.mjs';

describe('text replacer', () => {
  test('preserves input and logs when replacement processing fails', async () => {
    const error = new Error('replacement load failed');
    const logger = { error: jest.fn() };
    const replaceText = createTextReplacer({ loadReplacements: async () => { throw error; }, logger });
    await expect(replaceText('text')).resolves.toBe('text');
    expect(logger.error).toHaveBeenCalledWith('Replacements error', error);
  });
});
