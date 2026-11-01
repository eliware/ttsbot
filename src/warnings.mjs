export function logNodeWarning(warning, log) {
  try {
    if (warning?.code === 'DEP0040') return;
  } catch {}
  log.warn(`${warning.name}${warning.code ? ` (${warning.code})` : ''}: ${warning.message}`);
}
