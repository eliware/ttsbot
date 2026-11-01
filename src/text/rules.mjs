export function compileReplacements(raw) {
  const entries = JSON.parse(raw || '[]');
  return entries.map(({ search, replace }) => {
    const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return { replace, regex: new RegExp(`\\b${escaped}\\b`, 'gi') };
  });
}

export function applyReplacements(text, replacements) {
  return replacements.reduce((result, item) => result.replace(item.regex, item.replace), String(text));
}

