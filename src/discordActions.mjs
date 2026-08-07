import { joinVoiceChannel, getVoiceConnection, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import { loadUserSettings, saveUserSettings } from './settings.mjs';
import { ensureGuildState, skipCurrent, stopAndClear } from './ttsEngine.mjs';

export const AVAILABLE_VOICES = ['alloy', 'ash', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer'];

export function createDiscordActions({ log }) {
  return {
    async join(interaction) {
      const guildId = interaction.guildId;
      log.debug('Join command started', { guildId, userId: interaction.user?.id, channelId: interaction.channelId });
      const voiceChannel = interaction.member?.voice?.channel;
      if (!voiceChannel) {
        log.debug('Join rejected: user not in voice channel', { guildId, userId: interaction.user?.id });
        return interaction.reply({ content: 'You must be in a voice channel for me to join.', flags: 64 });
      }
      await interaction.deferReply();
      const existing = getVoiceConnection(guildId);
      if (existing) {
        log.debug('Join rejected: already connected', { guildId });
        return interaction.editReply({ content: 'I am already connected. Use /leave to disconnect first.' });
      }
      log.debug('Joining Discord voice channel', { guildId, channelId: voiceChannel.id, textChannelId: interaction.channelId });
      const connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId, adapterCreator: voiceChannel.guild.voiceAdapterCreator });
      const state = ensureGuildState(guildId);
      state.connection = connection;
      state.linkedTextChannelId = interaction.channelId;
      state.assignedUserOrder ??= [];
      state.assignedVoices ??= {};
      connection.subscribe(state.player);
      try {
        await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
        log.debug('Discord voice channel ready', { guildId, channelId: voiceChannel.id });
        await interaction.editReply({ content: `Joined ${voiceChannel.name} and linked to this text channel for TTS.` });
        log.debug('Join command completed', { guildId, voiceChannelId: voiceChannel.id });
      } catch (error) {
        log.error('Voice connection failed', error);
        connection.destroy();
        state.connection = null;
        state.linkedTextChannelId = null;
        await interaction.editReply({ content: 'Failed to connect to the voice channel. Please try /join again.' });
      }
    },
    async leave(interaction) {
      log.debug('Leave command started', { guildId: interaction.guildId, userId: interaction.user?.id });
      const state = ensureGuildState(interaction.guildId);
      const connection = getVoiceConnection(interaction.guildId);
      if (!connection) return interaction.reply({ content: 'I am not in a voice channel.', flags: 64 });
      connection.destroy();
      state.connection = null;
      state.linkedTextChannelId = null;
      state.queue = [];
      await interaction.reply('Left the voice channel and cleared state.');
      log.debug('Leave command completed', { guildId: interaction.guildId });
    },
    async voice(interaction, voice) {
      log.debug('Voice command started', { guildId: interaction.guildId, userId: interaction.user?.id, voice });
      const settings = await loadUserSettings(interaction.guildId, interaction.user.id);
      settings.voice = voice;
      await saveUserSettings(interaction.guildId, interaction.user.id, settings);
      await interaction.reply({ content: `Saved voice: ${voice}`, flags: 64 });
      log.debug('Voice command completed', { guildId: interaction.guildId, userId: interaction.user?.id, voice });
    },
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
