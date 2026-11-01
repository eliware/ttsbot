export function logIgnoredInteraction(log, interaction) {
  log.debug('Ignoring non-command interaction', { type: interaction.type, customId: interaction.customId });
}
