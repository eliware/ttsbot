import { compileReplacements } from './compiler.mjs';
import { createReplacementFileReader } from './file-reader.mjs';

export function createReplacementRuleLoader({ readReplacements = createReplacementFileReader() } = {}) {
  return async function loadReplacementRules() {
    return compileReplacements(await readReplacements());
  };
}
