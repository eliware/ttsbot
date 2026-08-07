export default async function ({ log }, client) {
  log.info('Discord client ready', { tag: client.user?.tag });
}
