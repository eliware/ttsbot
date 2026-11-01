import { createReplacementLoadFallback } from './load-fallback.mjs';

export function createReplacementLoader({
  readReplacements,
  loadReplacementRules = createReplacementLoadFallback({ readReplacements }),
} = {}) {
  let cache = null;
  return async function loadReplacements() {
    if (cache) return cache;
    cache = await loadReplacementRules();
    return cache;
  };
}
