import { destroyGuildVoiceConnection } from './voice-cleanup.mjs';

export async function cleanupGuildAudio({ client, stopAndClear, getVoiceConnection, ensureGuildState, log }) {
  for (const [guildId] of client.guilds.cache) {
    await stopGuildAudio({ guildId, stopAndClear, log });
    destroyGuildVoiceConnection({ guildId, getVoiceConnection, ensureGuildState, log });
  }
}

export async function stopGuildAudio({ guildId, stopAndClear, log }) {
  try { await stopAndClear(guildId); }
  catch (error) { log.error('Failed to stop guild audio', error); }
}
