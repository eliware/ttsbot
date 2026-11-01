export function compileReplacements(raw) {
  const entries = JSON.parse(raw || '[]');
  return entries.map(({ search, replace }) => {
    const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return { replace, regex: new RegExp(`\\b${escaped}\\b`, 'gi') };
  });
}
