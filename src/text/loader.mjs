import fs from 'node:fs/promises';
import { path } from '@eliware/common';
import { compileReplacements } from './compiler.mjs';

const REPLACEMENTS_PATH = path(import.meta, '..', '..', '..', 'replacements.json');

export function createReplacementLoader({ readFile = fs.readFile, filePath = REPLACEMENTS_PATH } = {}) {
  let cache = null;
  return async function loadReplacements() {
    if (cache) return cache;
    try { cache = compileReplacements(await readFile(filePath, 'utf8')); }
    catch { cache = []; }
    return cache;
  };
}
