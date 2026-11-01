export async function assignMessageVoice({ assignVoice, guildId, userId, state, log }) {
  try { await assignVoice(guildId, userId, state); }
  catch (error) { log.error('Failed to assign user voice', error); }
}
