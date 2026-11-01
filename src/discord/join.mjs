import {
  joinVoiceChannel,
  getVoiceConnection,
  entersState,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { ensureAssignmentState } from "../tts/assignment-state.mjs";
import { setGuildVoiceConnection } from "./connection-state.mjs";
import { handleJoinFailure } from "./join-failure.mjs";

const loadGuildState = async (guildId) =>
  (await import("../tts/state.mjs")).ensureGuildState(guildId);

export function createJoinAction({
  log,
  getConnection = getVoiceConnection,
  joinConnection = joinVoiceChannel,
  waitForState = entersState,
  connectionStatus = VoiceConnectionStatus,
  getGuildState = loadGuildState,
}) {
  return async function join(interaction) {
    const guildId = interaction.guildId;
    log.debug("Join command started", {
      guildId,
      userId: interaction.user?.id,
      channelId: interaction.channelId,
    });
    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) {
      log.debug("Join rejected: user not in voice channel", {
        guildId,
        userId: interaction.user?.id,
      });
      return interaction.reply({
        content: "You must be in a voice channel for me to join.",
        flags: 64,
      });
    }
    await interaction.deferReply();
    if (getConnection(guildId)) {
      log.debug("Join rejected: already connected", { guildId });
      return interaction.editReply({
        content: "I am already connected. Use /leave to disconnect first.",
      });
    }
    log.debug("Joining Discord voice channel", {
      guildId,
      channelId: voiceChannel.id,
      textChannelId: interaction.channelId,
    });
    const connection = joinConnection({
      channelId: voiceChannel.id,
      guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
    const state = await getGuildState(guildId);
    setGuildVoiceConnection(state, connection, interaction.channelId);
    ensureAssignmentState(state);
    connection.subscribe(state.player);
    try {
      await waitForState(connection, connectionStatus.Ready, 15_000);
      log.debug("Discord voice channel ready", { guildId, channelId: voiceChannel.id });
      await interaction.editReply({
        content: `Joined ${voiceChannel.name} and linked to this text channel for TTS.`,
      });
      log.debug("Join command completed", { guildId, voiceChannelId: voiceChannel.id });
    } catch (error) {
      await handleJoinFailure({ error, connection, state, interaction, log });
    }
  };
}
