import { logIgnoredInteraction } from "./ignored.mjs";
import { logReceivedInteraction } from "./received.mjs";
import { logUnknownInteractionCommand } from "./unknown.mjs";
import { logCompletedInteraction } from "./completed.mjs";

export function createInteractionLogger(log) {
  return {
    ignored: (interaction) => logIgnoredInteraction(log, interaction),
    received: (interaction) => logReceivedInteraction(log, interaction),
    unknown: (interaction) => logUnknownInteractionCommand(log, interaction),
    completed: (interaction) => logCompletedInteraction(log, interaction),
  };
}
