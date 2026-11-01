export function logReceivedInteraction(log, interaction) {
  log.debug('Discord command received', {
    guildId: interaction.guildId, channelId: interaction.channelId, userId: interaction.user?.id,
    command: interaction.commandName,
  });
}
