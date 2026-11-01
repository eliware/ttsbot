export function applyReplacements(text, replacements) {
  return replacements.reduce((result, item) => result.replace(item.regex, item.replace), String(text));
}
