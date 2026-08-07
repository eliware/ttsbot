import { describe, expect, jest, test } from '@jest/globals';
import fs from 'node:fs/promises';
import interactionCreate from '../events/interactionCreate.mjs';
import messageCreate from '../events/messageCreate.mjs';
import help from '../commands/help.mjs';
import voice from '../commands/voice.mjs';

const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };

describe('Discord handlers', () => {
  test('command definitions have matching handlers', async () => {
    const names = ['help', 'join', 'leave', 'voice', 'instructions', 'skip', 'stop'];
    for (const name of names) {
      const definition = JSON.parse(await fs.readFile(`commands/${name}.json`, 'utf8'));
      expect(definition.name).toBe(name);
      await import(`../commands/${name}.mjs`);
    }
  });

  test('interaction event dispatches a slash command', async () => {
    const handler = jest.fn();
    const interaction = { isChatInputCommand: () => true, commandName: 'voice' };
    await interactionCreate({ client: {}, log, commandHandlers: { voice: handler }, actions: {} }, interaction);
    expect(handler).toHaveBeenCalledWith({ client: {}, log, actions: {} }, interaction);
  });

  test('interaction event dispatches instruction modal submission', async () => {
    const instructionsSubmit = jest.fn();
    const interaction = { isModalSubmit: () => true, customId: 'instructions_modal' };
    await interactionCreate({ client: {}, log, commandHandlers: {}, actions: { instructionsSubmit } }, interaction);
    expect(instructionsSubmit).toHaveBeenCalledWith(interaction);
  });

  test('help and voice commands use expected interaction APIs', async () => {
    const reply = jest.fn();
    await help({ log }, { reply });
    expect(reply).toHaveBeenCalled();

    const actions = { voice: jest.fn() };
    const interaction = { options: { getString: jest.fn(() => 'marin') } };
    await voice({ actions }, interaction);
    expect(actions.voice).toHaveBeenCalledWith(interaction, 'marin');
  });

  test('message event ignores bots and unrelated messages', async () => {
    await messageCreate({ log }, { author: { bot: true }, guildId: 'guild' });
    await messageCreate({ log }, { author: { bot: false }, guildId: null });
    expect(log.error).not.toHaveBeenCalled();
  });
});
