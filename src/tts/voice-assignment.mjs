import { userHasSettings, loadUserSettings, saveUserSettings } from '../settings.mjs';

export const AVAILABLE_VOICES = ['alloy', 'ash', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer'];

export function createVoiceAssigner({
  hasSettings = userHasSettings,
  loadSettings = loadUserSettings,
  saveSettings = saveUserSettings,
  voices = AVAILABLE_VOICES,
  random = Math.random,
} = {}) {
  return async function assignVoice(guildId, userId, state) {
    if (await hasSettings(guildId, userId)) return;
    state.assignedUserOrder ??= [];
    state.assignedVoices ??= {};
    if (!state.assignedUserOrder.includes(userId)) state.assignedUserOrder.push(userId);
    const usage = new Map(voices.map((voice) => [voice, 0]));
    for (const voice of Object.values(state.assignedVoices)) usage.set(voice, (usage.get(voice) || 0) + 1);
    const leastUsed = Math.min(...usage.values());
    const candidates = voices.filter((voice) => usage.get(voice) === leastUsed);
    state.assignedVoices[userId] = candidates[Math.floor(random() * candidates.length)];
    const settings = await loadSettings(guildId, userId);
    settings.voice = state.assignedVoices[userId];
    await saveSettings(guildId, userId, settings);
  };
}
