import { log } from '@eliware/common';
import { applyReplacements } from './applicator.mjs';
import { preserveTextOnReplacementFailure } from './fallback.mjs';

export function createTextReplacer({ loadReplacements, logger = log }) {
  return async function replaceText(text) {
    const inputText = String(text);
    return preserveTextOnReplacementFailure(inputText, async () => applyReplacements(inputText, await loadReplacements()), logger);
  };
}
