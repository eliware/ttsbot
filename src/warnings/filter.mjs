export function isIgnoredNodeWarning(warning) {
  try { return warning?.code === 'DEP0040'; }
  catch { return false; }
}
