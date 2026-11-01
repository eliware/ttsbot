import { ensureGuildState, skipCurrent, stopAndClear } from './ttsEngine.mjs';
import { createVoiceSettingsAction } from './discord/voice-settings.mjs';
import { createVoiceConnectionActions } from './discord/voice-connection.mjs';

export const AVAILABLE_VOICES = ['alloy', 'ash', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer'];

export function createDiscordActions({ log }) {
  const setVoice = createVoiceSettingsAction({ log });
  const voiceConnectionActions = createVoiceConnectionActions({ log });
  return {
    ...voiceConnectionActions,
    voice: setVoice,
    async skip(interaction) {
      log.debug('Skip command started', { guildId: interaction.guildId, userId: interaction.user?.id });
      await skipCurrent(interaction.guildId);
      await interaction.reply({ content: 'Skipped current message (if any).', flags: 64 });
      log.debug('Skip command completed', { guildId: interaction.guildId });
    },
    async stop(interaction) {
      log.debug('Stop command started', { guildId: interaction.guildId, userId: interaction.user?.id });
      await stopAndClear(interaction.guildId);
      await interaction.reply({ content: 'Stopped playback and cleared queue.', flags: 64 });
    },
  };
}
