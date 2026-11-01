import { loadUserSettings } from '../settings.mjs';
import { replaceText as defaultReplaceText } from '../text/default-replacer.mjs';
import { log as defaultLog } from '@eliware/common';

export async function preparePlaybackInput({
  text, state, guildId, userId, waitForState, connectionStatus,
  getUserSettings = loadUserSettings, replaceText = defaultReplaceText, log = defaultLog,
}) {
  if (!text || text.length > 2000) return null;
  if (!state.connection) {
    log.warn('No voice connection for guild', guildId);
    return null;
  }
  try { await waitForState(state.connection, connectionStatus.Ready, 10_000); }
  catch {
    log.warn('Voice connection was not ready for guild', guildId);
    return null;
  }
  const settings = await getUserSettings(guildId, userId);
  let inputText = String(text);
  try { inputText = await replaceText(inputText); }
  catch (error) { log.error('Replacements error', error); }
  return { inputText, voice: settings.voice || 'coral' };
}
