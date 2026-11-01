import { joinVoiceChannel, getVoiceConnection, entersState, VoiceConnectionStatus } from '@discordjs/voice';

const loadGuildState = async (guildId) => (await import('../ttsEngine.mjs')).ensureGuildState(guildId);

export function createVoiceConnectionActions({
  log,
  getConnection = getVoiceConnection,
  joinConnection = joinVoiceChannel,
  waitForState = entersState,
  connectionStatus = VoiceConnectionStatus,
  getGuildState = loadGuildState,
}) {
  async function join(interaction) {
    const guildId = interaction.guildId;
    log.debug('Join command started', { guildId, userId: interaction.user?.id, channelId: interaction.channelId });
    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) {
      log.debug('Join rejected: user not in voice channel', { guildId, userId: interaction.user?.id });
      return interaction.reply({ content: 'You must be in a voice channel for me to join.', flags: 64 });
    }
    await interaction.deferReply();
    const existing = getConnection(guildId);
    if (existing) {
      log.debug('Join rejected: already connected', { guildId });
      return interaction.editReply({ content: 'I am already connected. Use /leave to disconnect first.' });
    }
    log.debug('Joining Discord voice channel', { guildId, channelId: voiceChannel.id, textChannelId: interaction.channelId });
    const connection = joinConnection({ channelId: voiceChannel.id, guildId, adapterCreator: voiceChannel.guild.voiceAdapterCreator });
    const state = await getGuildState(guildId);
    state.connection = connection;
    state.linkedTextChannelId = interaction.channelId;
    state.assignedUserOrder ??= [];
    state.assignedVoices ??= {};
    connection.subscribe(state.player);
    try {
      await waitForState(connection, connectionStatus.Ready, 15_000);
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
  }

  async function leave(interaction) {
    log.debug('Leave command started', { guildId: interaction.guildId, userId: interaction.user?.id });
    const state = await getGuildState(interaction.guildId);
    const connection = getConnection(interaction.guildId);
    if (!connection) return interaction.reply({ content: 'I am not in a voice channel.', flags: 64 });
    connection.destroy();
    state.connection = null;
    state.linkedTextChannelId = null;
    state.queue = [];
    await interaction.reply('Left the voice channel and cleared state.');
    log.debug('Leave command completed', { guildId: interaction.guildId });
  }

  return { join, leave };
}
