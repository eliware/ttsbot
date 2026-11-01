import { log } from '@eliware/common';

export function compileReplacements(raw) {
  const entries = JSON.parse(raw || '[]');
  return entries.map(({ search, replace }) => {
    const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return { replace, regex: new RegExp(`\\b${escaped}\\b`, 'gi') };
  });
}

export function applyReplacements(text, replacements) {
  return replacements.reduce((result, item) => result.replace(item.regex, item.replace), String(text));
}

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
