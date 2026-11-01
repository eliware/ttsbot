export function compileReplacements(entries) {
  return entries.map(({ search, replace }) => {
    const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return { replace, regex: new RegExp(`\\b${escaped}\\b`, "gi") };
  });
}
