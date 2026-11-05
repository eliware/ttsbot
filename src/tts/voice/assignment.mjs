import { userHasSettings, loadUserSettings, saveUserSettings } from "../../settings.mjs";
import { ensureAssignmentState } from "../assignment-state.mjs";
import { selectLeastUsedVoice } from "./policy.mjs";

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
    const voice = selectLeastUsedVoice({
      voices,
      assignments: state.assignedVoices ?? {},
      random,
    });
    const settings = await loadSettings(guildId, userId);
    settings.voice = voice;
    await saveSettings(guildId, userId, settings);
    ensureAssignmentState(state);
    if (!state.assignedUserOrder.includes(userId)) state.assignedUserOrder.push(userId);
    state.assignedVoices[userId] = voice;
  };
}
