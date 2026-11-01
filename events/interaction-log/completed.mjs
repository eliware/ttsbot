export function logCompletedInteraction(log, interaction) {
  log.debug('Discord command completed', {
    guildId: interaction.guildId, userId: interaction.user?.id, command: interaction.commandName,
  });
}
