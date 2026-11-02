export function selectLeastUsedVoice({ voices, assignments, random = Math.random }) {
  if (voices.length === 0) throw new RangeError("At least one voice is required");
  const usage = new Map(voices.map((voice) => [voice, 0]));
  for (const voice of Object.values(assignments)) usage.set(voice, (usage.get(voice) || 0) + 1);
  const leastUsed = Math.min(...usage.values());
  const candidates = voices.filter((voice) => usage.get(voice) === leastUsed);
  return candidates[Math.floor(random() * candidates.length)];
}
