import { describe, expect, test } from '@jest/globals';
import { createTextReplacer } from '../../src/text/replacer.mjs';

describe('text replacement coordinator', () => {
  test('loads and applies replacement rules', async () => {
    const replaceText = createTextReplacer({
      loadReplacements: async () => [{ regex: /\bbrb\b/gi, replace: 'be right back' }],
    });
    await expect(replaceText('BRB soon')).resolves.toBe('be right back soon');
  });
});
