import { createGuildState } from "./state-factory.mjs";

const guildStates = new Map();

export function ensureGuildState(guildId) {
  if (!guildStates.has(guildId)) {
    guildStates.set(guildId, createGuildState({ guildId }));
  }
  return guildStates.get(guildId);
}
