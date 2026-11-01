import { compileReplacements } from './compiler.mjs';
import { createReplacementFileReader } from './file-reader.mjs';

export function createReplacementLoadPolicy({ readReplacements = createReplacementFileReader() } = {}) {
  return async function loadReplacementRules() {
    try { return compileReplacements(await readReplacements()); }
    catch { return []; }
  };
}
