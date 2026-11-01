const runQueueAction = (name) => (...args) => import('../tts/queue-control.mjs').then((actions) => actions[name](...args));

export function createPlaybackActions({ log, skip = runQueueAction('skipCurrent'), stop = runQueueAction('stopAndClear') }) {
  return {
    async skip(interaction) {
      log.debug('Skip command started', { guildId: interaction.guildId, userId: interaction.user?.id });
      await skip(interaction.guildId);
      await interaction.reply({ content: 'Skipped current message (if any).', flags: 64 });
      log.debug('Skip command completed', { guildId: interaction.guildId });
    },
    async stop(interaction) {
      log.debug('Stop command started', { guildId: interaction.guildId, userId: interaction.user?.id });
      await stop(interaction.guildId);
      await interaction.reply({ content: 'Stopped playback and cleared queue.', flags: 64 });
    },
  };
}
