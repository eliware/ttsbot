import { describe, expect, jest, test } from '@jest/globals';
import { createPlaybackActions } from '../../src/discord/playback.mjs';

describe('Discord playback actions', () => {
  test('skips the current audio and acknowledges the command', async () => {
    const skip = jest.fn(async () => {});
    const log = { debug: jest.fn() };
    const interaction = { guildId: 'guild', user: { id: 'user' }, reply: jest.fn(async () => {}) };
    const actions = createPlaybackActions({ log, skip });
    await actions.skip(interaction);
    expect(skip).toHaveBeenCalledWith('guild');
    expect(interaction.reply).toHaveBeenCalledWith({ content: 'Skipped current message (if any).', flags: 64 });
    expect(log.debug).toHaveBeenCalledTimes(2);
  });

  test('stops playback and acknowledges the command', async () => {
    const stop = jest.fn(async () => {});
    const interaction = { guildId: 'guild', user: { id: 'user' }, reply: jest.fn(async () => {}) };
    await createPlaybackActions({ log: { debug: jest.fn() }, stop }).stop(interaction);
    expect(stop).toHaveBeenCalledWith('guild');
    expect(interaction.reply).toHaveBeenCalledWith({ content: 'Stopped playback and cleared queue.', flags: 64 });
  });
});
