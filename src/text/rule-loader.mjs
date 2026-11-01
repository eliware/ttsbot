import { compileReplacements } from './compiler.mjs';
import { createReplacementFileReader } from './file-reader.mjs';
import { parseReplacementEntries } from './json-loader.mjs';

export function createReplacementRuleLoader({ readReplacements = createReplacementFileReader() } = {}) {
  return async function loadReplacementRules() {
    return compileReplacements(parseReplacementEntries(await readReplacements()));
  };
}
