import { describe, expect, jest, test } from "@jest/globals";
import interactionCreate from "../../events/interactionCreate.mjs";
import help from "../../src/commands/help.mjs";
import voice from "../../src/commands/voice.mjs";
import join from "../../src/commands/join.mjs";
import leave from "../../src/commands/leave.mjs";

const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };

describe("Discord handlers", () => {
  test("command definitions have matching handlers", async () => {
    const names = ["help", "join", "leave", "voice", "skip", "stop"];
    for (const name of names) {
      await import(`../../src/commands/${name}.mjs`);
    }
  });

  test("interaction event dispatches a slash command", async () => {
    const handler = jest.fn();
    const interaction = { isChatInputCommand: () => true, commandName: "voice" };
    await interactionCreate(
      { client: {}, log, commandHandlers: { voice: handler }, actions: {} },
      interaction,
    );
    expect(handler).toHaveBeenCalledWith({ client: {}, log, actions: {} }, interaction);
  });

  test("interaction event ignores noncommands and warns unknown commands", async () => {
    await interactionCreate(
      { client: {}, log, commandHandlers: {}, actions: {} },
      { isChatInputCommand: () => false },
    );
    await interactionCreate(
      { client: {}, log, commandHandlers: {}, actions: {} },
      { isChatInputCommand: () => true, commandName: "missing" },
    );
    expect(log.warn).toHaveBeenCalledWith("Unknown Discord command", { command: "missing" });
  });

  test("command wrappers dispatch actions", async () => {
    const actions = { join: jest.fn(), leave: jest.fn() };
    const interaction = { options: { getString: jest.fn(() => "coral") } };
    await join({ actions }, interaction);
    await leave({ actions }, interaction);
    expect(actions.join).toHaveBeenCalledWith(interaction);
    expect(actions.leave).toHaveBeenCalledWith(interaction);
  });

  test("help and voice commands use expected interaction APIs", async () => {
    const reply = jest.fn();
    await help({ log }, { reply });
    expect(reply).toHaveBeenCalled();

    const actions = { voice: jest.fn() };
    const interaction = { options: { getString: jest.fn(() => "coral") } };
    await voice({ actions }, interaction);
    expect(actions.voice).toHaveBeenCalledWith(interaction, "coral");
  });
});
