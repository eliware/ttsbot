export default async function ({ client, log, commandHandlers, actions }, interaction) {
  if (!interaction.isChatInputCommand?.()) {
    log.debug('Ignoring non-command interaction', { type: interaction.type, customId: interaction.customId });
    return;
  }
  log.debug('Discord command received', { guildId: interaction.guildId, channelId: interaction.channelId, userId: interaction.user?.id, command: interaction.commandName });
  const handler = commandHandlers?.[interaction.commandName];
  if (!handler) return log.warn('Unknown Discord command', { command: interaction.commandName });
  await handler({ client, log, actions }, interaction);
  log.debug('Discord command completed', { guildId: interaction.guildId, userId: interaction.user?.id, command: interaction.commandName });
}
