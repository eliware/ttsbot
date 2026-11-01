import { logIgnoredInteraction } from "./interaction-log/ignored.mjs";
import { logReceivedInteraction } from "./interaction-log/received.mjs";
import { logUnknownInteractionCommand } from "./interaction-log/unknown.mjs";
import { logCompletedInteraction } from "./interaction-log/completed.mjs";

export function createInteractionLogger(log) {
  return {
    ignored: (interaction) => logIgnoredInteraction(log, interaction),
    received: (interaction) => logReceivedInteraction(log, interaction),
    unknown: (interaction) => logUnknownInteractionCommand(log, interaction),
    completed: (interaction) => logCompletedInteraction(log, interaction),
  };
}
