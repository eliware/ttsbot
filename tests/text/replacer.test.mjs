import { describe, expect, jest, test } from '@jest/globals';
import { createTextReplacer } from '../../src/text/replacer.mjs';
import { replaceText as defaultReplaceText } from '../../src/text/default-replacer.mjs';

describe('text replacer', () => {
  test('uses the configured replacement file in the default replacer', async () => {
    await expect(defaultReplaceText('brb')).resolves.toBe('be right back');
  });

  test('applies replacement rules to input', async () => {
    const replaceText = createTextReplacer({
      loadReplacements: async () => [{ regex: /\bbrb\b/gi, replace: 'be right back' }],
    });
    await expect(replaceText('BRB soon')).resolves.toBe('be right back soon');
  });

  test('preserves input and logs when replacement processing fails', async () => {
    const error = new Error('replacement load failed');
    const logger = { error: jest.fn() };
    const replaceText = createTextReplacer({ loadReplacements: async () => { throw error; }, logger });
    await expect(replaceText('text')).resolves.toBe('text');
    expect(logger.error).toHaveBeenCalledWith('Replacements error', error);
  });
});
