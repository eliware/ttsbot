import { clearGuildVoiceConnection } from './connection-state.mjs';

export async function handleJoinFailure({ error, connection, state, interaction, log }) {
  log.error('Voice connection failed', error);
  connection.destroy();
  clearGuildVoiceConnection(state);
  await interaction.editReply({ content: 'Failed to connect to the voice channel. Please try /join again.' });
}
