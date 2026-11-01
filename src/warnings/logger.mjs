import { isIgnoredNodeWarning } from "./filter.mjs";
import { formatNodeWarning } from "./formatter.mjs";

export function logNodeWarning(warning, log) {
  if (isIgnoredNodeWarning(warning)) return;
  log.warn(formatNodeWarning(warning));
}
