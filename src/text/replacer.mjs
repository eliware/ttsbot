import { log } from '@eliware/common';
import { applyReplacements } from './applicator.mjs';

export function createTextReplacer({ loadReplacements, logger = log }) {
  return async function replaceText(text) {
    const inputText = String(text);
    try { return applyReplacements(inputText, await loadReplacements()); }
    catch (error) {
      logger.error('Replacements error', error);
      return inputText;
    }
  };
}
