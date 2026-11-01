export function destroyGuildVoiceConnection({ guildId, getVoiceConnection, ensureGuildState, log }) {
  try { getVoiceConnection(guildId)?.destroy(); }
  catch (error) { log.error('Failed to destroy voice connection', error); }
  ensureGuildState(guildId).connection = null;
}
