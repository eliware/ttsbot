import { createReplacementLoadPolicy } from './load-policy.mjs';

export function createReplacementLoader({
  readReplacements,
  loadReplacementRules = createReplacementLoadPolicy({ readReplacements }),
} = {}) {
  let cache = null;
  return async function loadReplacements() {
    if (cache) return cache;
    cache = await loadReplacementRules();
    return cache;
  };
}
