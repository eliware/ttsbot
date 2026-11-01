import { loadUserSettings, saveUserSettings } from '../settings.mjs';

export function createVoiceSettingsAction({ log, loadSettings = loadUserSettings, saveSettings = saveUserSettings }) {
  return async function setVoice(interaction, voice) {
    log.debug('Voice command started', { guildId: interaction.guildId, userId: interaction.user?.id, voice });
    const settings = await loadSettings(interaction.guildId, interaction.user.id);
    settings.voice = voice;
    await saveSettings(interaction.guildId, interaction.user.id, settings);
    await interaction.reply({ content: `Saved voice: ${voice}`, flags: 64 });
    log.debug('Voice command completed', { guildId: interaction.guildId, userId: interaction.user?.id, voice });
  };
}
