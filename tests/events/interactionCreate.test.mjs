import { describe, expect, jest, test } from "@jest/globals";
import interactionCreate from "../../events/interactionCreate.mjs";
import help from "../../src/commands/help.mjs";
import voice from "../../src/commands/voice.mjs";
import join from "../../src/commands/join.mjs";
import leave from "../../src/commands/leave.mjs";
import skip from "../../src/commands/skip.mjs";
import stop from "../../src/commands/stop.mjs";
import helpDefinition from "../../commands/help.json" with { type: "json" };
import joinDefinition from "../../commands/join.json" with { type: "json" };
import leaveDefinition from "../../commands/leave.json" with { type: "json" };
import skipDefinition from "../../commands/skip.json" with { type: "json" };
import stopDefinition from "../../commands/stop.json" with { type: "json" };
import voiceDefinition from "../../commands/voice.json" with { type: "json" };

const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };

describe("Discord handlers", () => {
  test("command definitions have matching handlers", () => {
    const definitions = [
      helpDefinition,
      joinDefinition,
      leaveDefinition,
      skipDefinition,
      stopDefinition,
      voiceDefinition,
    ];
    const handlers = { help, join, leave, skip, stop, voice };
    expect(Object.keys(handlers).sort()).toEqual(definitions.map(({ name }) => name).sort());
    for (const definition of definitions) {
      expect(definition.type).toBe(1);
      expect(typeof handlers[definition.name]).toBe("function");
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
    const msg = jest.fn(() => "localized help");
    await help({ log, msg }, { locale: "fr", reply });
    expect(msg).toHaveBeenCalledWith("fr", "help", expect.any(String));
    expect(reply).toHaveBeenCalledWith({ content: "localized help", flags: 64 });

    const actions = { voice: jest.fn() };
    const interaction = { options: { getString: jest.fn(() => "coral") } };
    await voice({ actions }, interaction);
    expect(actions.voice).toHaveBeenCalledWith(interaction, "coral");
  });
});
