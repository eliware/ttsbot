import { log as defaultLog } from "@eliware/common";
import { createReplacementRuleLoader } from "./rule-loader.mjs";

export async function preserveTextOnReplacementFailure(inputText, operation, logger = defaultLog) {
  try {
    return await operation();
  } catch (error) {
    logger.error("Replacements error", error);
    return inputText;
  }
}

export function createReplacementLoadFallback({
  readReplacements,
  loadRules = createReplacementRuleLoader({ readReplacements }),
} = {}) {
  return async function loadReplacementRules() {
    try {
      return await loadRules();
    } catch {
      return [];
    }
  };
}
