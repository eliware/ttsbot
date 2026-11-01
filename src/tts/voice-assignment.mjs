import { userHasSettings, loadUserSettings, saveUserSettings } from "../settings.mjs";
import { ensureAssignmentState } from "./assignment-state.mjs";
import { selectLeastUsedVoice } from "./voice-policy.mjs";

export const AVAILABLE_VOICES = [
  "alloy",
  "ash",
  "coral",
  "echo",
  "fable",
  "nova",
  "onyx",
  "sage",
  "shimmer",
];

export function createVoiceAssigner({
  hasSettings = userHasSettings,
  loadSettings = loadUserSettings,
  saveSettings = saveUserSettings,
  voices = AVAILABLE_VOICES,
  random = Math.random,
} = {}) {
  return async function assignVoice(guildId, userId, state) {
    if (await hasSettings(guildId, userId)) return;
    if (voices.length === 0) throw new RangeError("At least one voice is required");
    ensureAssignmentState(state);
    if (!state.assignedUserOrder.includes(userId)) state.assignedUserOrder.push(userId);
    state.assignedVoices[userId] = selectLeastUsedVoice({
      voices,
      assignments: state.assignedVoices,
      random,
    });
    const settings = await loadSettings(guildId, userId);
    settings.voice = state.assignedVoices[userId];
    await saveSettings(guildId, userId, settings);
  };
}
