export default async function ({ log, msg }, interaction) {
  await interaction.reply({
    content: msg(
      interaction.locale,
      "help",
      "TTS commands: /join, /leave, /voice, /skip, /stop. Messages in the linked text channel are spoken.",
    ),
    flags: 64,
  });
  log.debug("help command handled");
}
