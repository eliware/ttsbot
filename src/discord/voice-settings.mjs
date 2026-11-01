import { loadUserSettings, saveUserSettings } from "../settings.mjs";
import { AVAILABLE_VOICES } from "../tts/voice-assignment.mjs";

export function createVoiceSettingsAction({
  log,
  loadSettings = loadUserSettings,
  saveSettings = saveUserSettings,
  voices = AVAILABLE_VOICES,
}) {
  return async function setVoice(interaction, voice) {
    if (!voices.includes(voice)) {
      await interaction.reply({ content: "Choose a supported voice.", flags: 64 });
      return;
    }
    log.debug("Voice command started", {
      guildId: interaction.guildId,
      userId: interaction.user?.id,
      voice,
    });
    const settings = await loadSettings(interaction.guildId, interaction.user.id);
    settings.voice = voice;
    await saveSettings(interaction.guildId, interaction.user.id, settings);
    await interaction.reply({ content: `Saved voice: ${voice}`, flags: 64 });
    log.debug("Voice command completed", {
      guildId: interaction.guildId,
      userId: interaction.user?.id,
      voice,
    });
  };
}
