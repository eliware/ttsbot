import { createReplacementRuleLoader } from './rule-loader.mjs';

export function createReplacementLoadPolicy({
  readReplacements,
  loadRules = createReplacementRuleLoader({ readReplacements }),
} = {}) {
  return async function loadReplacementRules() {
    try { return await loadRules(); }
    catch { return []; }
  };
}
