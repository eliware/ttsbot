import { getVoiceConnection } from "@discordjs/voice";
import { clearGuildVoiceConnection } from "./connection-state.mjs";

const loadGuildState = async (guildId) =>
  (await import("../tts/state.mjs")).ensureGuildState(guildId);
const stopGuildAudio = async (guildId) => (await import("../tts/stop.mjs")).stopAndClear(guildId);

export function createLeaveAction({
  log,
  getConnection = getVoiceConnection,
  getGuildState = loadGuildState,
  stopAndClear = stopGuildAudio,
}) {
  return async function leave(interaction) {
    log.debug("Leave command started", {
      guildId: interaction.guildId,
      userId: interaction.user?.id,
    });
    const state = await getGuildState(interaction.guildId);
    const connection = getConnection(interaction.guildId);
    if (!connection)
      return interaction.reply({ content: "I am not in a voice channel.", flags: 64 });
    await stopAndClear(interaction.guildId);
    connection.destroy();
    clearGuildVoiceConnection(state, { clearQueue: true });
    await interaction.reply("Left the voice channel and cleared state.");
    log.debug("Leave command completed", { guildId: interaction.guildId });
  };
}
