import { describe, expect, jest, test } from '@jest/globals';
import { assignMessageVoice } from '../../src/discord/message-voice.mjs';

describe('message voice assignment', () => {
  test('passes the message guild, user, and state to the assigner', async () => {
    const assignVoice = jest.fn(async () => {});
    await assignMessageVoice({ assignVoice, guildId: 'guild', userId: 'user', state: {}, log: { error: jest.fn() } });
    expect(assignVoice).toHaveBeenCalledWith('guild', 'user', expect.any(Object));
  });

  test('logs assignment failures and returns to event processing', async () => {
    const error = new Error('assignment failed');
    const log = { error: jest.fn() };
    await expect(assignMessageVoice({ assignVoice: async () => { throw error; }, guildId: 'g', userId: 'u', state: {}, log }))
      .resolves.toBeUndefined();
    expect(log.error).toHaveBeenCalledWith('Failed to assign user voice', error);
  });
});
