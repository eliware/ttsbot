export function logUnknownInteractionCommand(log, interaction) {
  log.warn('Unknown Discord command', { command: interaction.commandName });
}
