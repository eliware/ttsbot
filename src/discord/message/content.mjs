export function normalizeMessageContent(content) {
  const normalized = content?.trim();
  if (!normalized || normalized.length > 2000) return null;
  return normalized;
}
