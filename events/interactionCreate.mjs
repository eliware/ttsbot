export default async function ({ client, log, commandHandlers, actions }, interaction) {
  if (interaction.isModalSubmit?.()) {
    if (interaction.customId === 'instructions_modal') await actions.instructionsSubmit(interaction);
    return;
  }
  if (!interaction.isChatInputCommand?.()) return;
  const handler = commandHandlers?.[interaction.commandName];
  if (!handler) return log.warn('Unknown Discord command', { command: interaction.commandName });
  await handler({ client, log, actions }, interaction);
}
