export default async function ({ actions }, interaction) {
  await actions.instructions(interaction);
}
