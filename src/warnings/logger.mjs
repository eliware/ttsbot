import { isIgnoredNodeWarning } from './filter.mjs';

export function logNodeWarning(warning, log) {
  if (isIgnoredNodeWarning(warning)) return;
  log.warn(`${warning.name}${warning.code ? ` (${warning.code})` : ''}: ${warning.message}`);
}
