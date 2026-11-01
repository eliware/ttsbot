import { compileReplacements } from './compiler.mjs';
import { createReplacementFileReader } from './file-reader.mjs';

export function createReplacementLoader({ readReplacements = createReplacementFileReader() } = {}) {
  let cache = null;
  return async function loadReplacements() {
    if (cache) return cache;
    try { cache = compileReplacements(await readReplacements()); }
    catch { cache = []; }
    return cache;
  };
}
