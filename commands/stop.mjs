export default async function ({ actions }, interaction) {
  await actions.stop(interaction);
}
