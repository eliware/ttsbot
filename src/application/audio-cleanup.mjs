export async function stopGuildAudio({ guildId, stopAndClear, log }) {
  try { await stopAndClear(guildId); }
  catch (error) { log.error('Failed to stop guild audio', error); }
}
