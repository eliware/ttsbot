export function createInteractionLogger(log) {
  return {
    ignored(interaction) {
      log.debug('Ignoring non-command interaction', { type: interaction.type, customId: interaction.customId });
    },
    received(interaction) {
      log.debug('Discord command received', {
        guildId: interaction.guildId, channelId: interaction.channelId, userId: interaction.user?.id,
        command: interaction.commandName,
      });
    },
    unknown(interaction) {
      log.warn('Unknown Discord command', { command: interaction.commandName });
    },
    completed(interaction) {
      log.debug('Discord command completed', {
        guildId: interaction.guildId, userId: interaction.user?.id, command: interaction.commandName,
      });
    },
  };
}
