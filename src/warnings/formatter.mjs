export function formatNodeWarning(warning) {
  return `${warning.name}${warning.code ? ` (${warning.code})` : ""}: ${warning.message}`;
}
