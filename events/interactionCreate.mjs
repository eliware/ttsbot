export default async function ({ client, log, commandHandlers, ...contextData }, interaction) {
  if (!interaction.isChatInputCommand?.()) return;
  const handler = commandHandlers?.[interaction.commandName];
  if (!handler) {
    log.warn('Unknown Discord command', { command: interaction.commandName });
    return;
  }
  await handler({ client, log, ...contextData }, interaction);
}
