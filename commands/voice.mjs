export default async function ({ actions }, interaction) {
  await actions.voice(interaction, interaction.options.getString('voice', true));
}
