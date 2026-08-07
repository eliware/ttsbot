export default async function ({ log }, interaction) {
  await interaction.reply({
    content: 'TTS commands: /join, /leave, /voice, /skip, /stop. Messages in the linked text channel are spoken.',
    flags: 64,
  });
  log.debug('help command handled');
}
