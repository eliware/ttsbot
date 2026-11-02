import { createInteractionLogger } from "../discord/interaction-log/logger.mjs";

export default async function ({ client, log, commandHandlers, actions }, interaction) {
  const interactionLog = createInteractionLogger(log);
  if (!interaction.isChatInputCommand?.()) {
    interactionLog.ignored(interaction);
    return;
  }
  interactionLog.received(interaction);
  const handler = commandHandlers?.[interaction.commandName];
  if (!handler) return interactionLog.unknown(interaction);
  await handler({ client, log, actions }, interaction);
  interactionLog.completed(interaction);
}
