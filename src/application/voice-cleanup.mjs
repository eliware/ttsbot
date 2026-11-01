export function destroyGuildVoiceConnection({
  guildId,
  getVoiceConnection,
  ensureGuildState,
  log,
}) {
  try {
    getVoiceConnection(guildId)?.destroy();
  } catch (error) {
    log.error("Failed to destroy voice connection", error);
  }
  try {
    ensureGuildState(guildId).connection = null;
  } catch (error) {
    log.error("Failed to clear guild voice state", error);
  }
}
