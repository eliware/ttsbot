export function selectLeastUsedVoice({ voices, assignments, random = Math.random }) {
  if (voices.length === 0) throw new RangeError("At least one voice is required");
  const usage = new Map(voices.map((voice) => [voice, 0]));
  for (const voice of Object.values(assignments)) {
    if (usage.has(voice)) usage.set(voice, usage.get(voice) + 1);
  }
  const leastUsed = Math.min(...usage.values());
  const candidates = voices.filter((voice) => usage.get(voice) === leastUsed);
  const index = Math.max(
    0,
    Math.min(candidates.length - 1, Math.floor(random() * candidates.length)),
  );
  return candidates[index];
}
