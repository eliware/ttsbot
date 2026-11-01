import fs from 'node:fs/promises';
import { log, path } from '@eliware/common';

const REPLACEMENTS_PATH = path(import.meta, '..', '..', 'replacements.json');

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

export function createReplacementLoader({ readFile = fs.readFile, filePath = REPLACEMENTS_PATH } = {}) {
  let cache = null;
  return async function loadReplacements() {
    if (cache) return cache;
    try {
      cache = compileReplacements(await readFile(filePath, 'utf8'));
    } catch {
      cache = [];
    }
    return cache;
  };
}

export function createTextReplacer({ loadReplacements, logger = log }) {
  return async function replaceText(text) {
    const inputText = String(text);
    try {
      return applyReplacements(inputText, await loadReplacements());
    } catch (error) {
      logger.error('Replacements error', error);
      return inputText;
    }
  };
}

const loadReplacements = createReplacementLoader();
export const replaceText = createTextReplacer({ loadReplacements });
