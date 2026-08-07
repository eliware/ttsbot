import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { joinVoiceChannel, getVoiceConnection, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import { loadUserSettings, saveUserSettings } from './settings.mjs';
import { ensureGuildState, skipCurrent, stopAndClear } from './ttsEngine.mjs';

export const AVAILABLE_VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer', 'verse', 'marin', 'cedar'];

export function createDiscordActions({ log }) {
  return {
    async join(interaction) {
      const guildId = interaction.guildId;
      const voiceChannel = interaction.member?.voice?.channel;
      if (!voiceChannel) return interaction.reply({ content: 'You must be in a voice channel for me to join.', flags: 64 });
      await interaction.deferReply();
      const existing = getVoiceConnection(guildId);
      if (existing) return interaction.editReply({ content: 'I am already connected. Use /leave to disconnect first.' });
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
      } catch (error) {
        log.error('Voice connection failed', error);
        connection.destroy();
        state.connection = null;
        state.linkedTextChannelId = null;
        await interaction.editReply({ content: 'Failed to connect to the voice channel. Please try /join again.' });
      }
    },
    async leave(interaction) {
      const state = ensureGuildState(interaction.guildId);
      const connection = getVoiceConnection(interaction.guildId);
      if (!connection) return interaction.reply({ content: 'I am not in a voice channel.', flags: 64 });
      connection.destroy();
      state.connection = null;
      state.linkedTextChannelId = null;
      state.queue = [];
      await interaction.reply('Left the voice channel and cleared state.');
    },
    async voice(interaction, voice) {
      const settings = await loadUserSettings(interaction.guildId, interaction.user.id);
      settings.voice = voice;
      await saveUserSettings(interaction.guildId, interaction.user.id, settings);
      await interaction.reply({ content: `Saved voice: ${voice}`, flags: 64 });
    },
    async instructions(interaction) {
      const settings = await loadUserSettings(interaction.guildId, interaction.user.id);
      const input = new TextInputBuilder().setCustomId('instructions_input').setLabel('TTS instructions (tone/style)').setStyle(TextInputStyle.Paragraph).setPlaceholder('e.g. Calm, storytelling tone').setRequired(false).setValue(String(settings.instructions || '').slice(0, 4000));
      const modal = new ModalBuilder().setCustomId('instructions_modal').setTitle('Set custom TTS instructions').addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
    },
    async instructionsSubmit(interaction) {
      const settings = await loadUserSettings(interaction.guildId, interaction.user.id);
      settings.instructions = interaction.fields.getTextInputValue('instructions_input');
      await saveUserSettings(interaction.guildId, interaction.user.id, settings);
      await interaction.reply({ content: 'Saved instructions.', flags: 64 });
    },
    async skip(interaction) {
      await skipCurrent(interaction.guildId);
      await interaction.reply({ content: 'Skipped current message (if any).', flags: 64 });
    },
    async stop(interaction) {
      await stopAndClear(interaction.guildId);
      await interaction.reply({ content: 'Stopped playback and cleared queue.', flags: 64 });
    },
  };
}
