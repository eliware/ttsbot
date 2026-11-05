import { createReplacementLoadFallback } from "./fallback.mjs";
import { createCachedLoader } from "./cache.mjs";

export function createReplacementLoader({
  readReplacements,
  loadReplacementRules = createReplacementLoadFallback({ readReplacements }),
} = {}) {
  const loadCachedRules = createCachedLoader(loadReplacementRules);
  return async function loadReplacementRulesWithFallback() {
    return (await loadCachedRules()) ?? [];
  };
}
