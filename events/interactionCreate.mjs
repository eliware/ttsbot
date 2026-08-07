export default async function ({ client, log, commandHandlers, actions }, interaction) {
  if (!interaction.isChatInputCommand?.()) return;
  const handler = commandHandlers?.[interaction.commandName];
  if (!handler) return log.warn('Unknown Discord command', { command: interaction.commandName });
  await handler({ client, log, actions }, interaction);
}
