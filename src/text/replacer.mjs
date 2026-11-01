import { log } from '@eliware/common';
import { applyReplacements, normalizeReplacementInput } from './applicator.mjs';
import { preserveTextOnReplacementFailure } from './fallback.mjs';

export function createTextReplacer({ loadReplacements, logger = log }) {
  return async function replaceText(text) {
    const inputText = normalizeReplacementInput(text);
    return preserveTextOnReplacementFailure(inputText, async () => applyReplacements(inputText, await loadReplacements()), logger);
  };
}
