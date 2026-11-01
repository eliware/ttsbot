export function validatePlaybackInput({ text, state, guildId, log }) {
  if (!text || text.length > 2000) return false;
  if (!state.connection) {
    log.warn('No voice connection for guild', guildId);
    return false;
  }
  return true;
}
