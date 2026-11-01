import { createReplacementLoadFallback } from "./load-fallback.mjs";
import { createCachedLoader } from "./cache.mjs";

export function createReplacementLoader({
  readReplacements,
  loadReplacementRules = createReplacementLoadFallback({ readReplacements }),
} = {}) {
  return createCachedLoader(loadReplacementRules);
}
