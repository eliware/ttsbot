import { destroyGuildVoiceConnection } from "./voice-cleanup.mjs";
import { getGuildStateIds as getActiveGuildStateIds } from "../tts/state.mjs";

export async function cleanupGuildAudio({
  client,
  stopAndClear,
  getVoiceConnection,
  ensureGuildState,
  getGuildStateIds = getActiveGuildStateIds,
  log,
}) {
  const guildIds = new Set([...client.guilds.cache.keys(), ...getGuildStateIds()]);
  for (const guildId of guildIds) {
    await stopGuildAudio({ guildId, stopAndClear, log });
    destroyGuildVoiceConnection({ guildId, getVoiceConnection, ensureGuildState, log });
  }
}

export async function stopGuildAudio({ guildId, stopAndClear, log }) {
  try {
    await stopAndClear(guildId);
  } catch (error) {
    log.error("Failed to stop guild audio", error);
  }
}
