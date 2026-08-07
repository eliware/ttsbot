import { afterEach, describe, expect, jest, test } from '@jest/globals';

const hasSettings = jest.fn();
const loadSettings = jest.fn();
const saveSettings = jest.fn();
const ensureGuildState = jest.fn();
const enqueueSpeech = jest.fn();

jest.unstable_mockModule('../src/settings.mjs', () => ({
  userHasSettings: hasSettings,
  loadUserSettings: loadSettings,
  saveUserSettings: saveSettings,
}));
jest.unstable_mockModule('../src/ttsEngine.mjs', () => ({
  ensureGuildState,
  enqueueSpeech,
  skipCurrent: jest.fn(),
  stopAndClear: jest.fn(),
}));
jest.unstable_mockModule('../src/discordActions.mjs', () => ({
  AVAILABLE_VOICES: ['alloy', 'ash', 'coral'],
}));

const { default: messageCreate } = await import('../events/messageCreate.mjs');

const log = { debug: jest.fn(), error: jest.fn() };

afterEach(() => {
  jest.clearAllMocks();
});

describe('messageCreate event', () => {
  test('ignores bot and direct messages', async () => {
    await messageCreate({ log }, { author: { bot: true }, guildId: 'guild' });
    await messageCreate({ log }, { author: { bot: false }, guildId: null });
    expect(ensureGuildState).not.toHaveBeenCalled();
    expect(enqueueSpeech).not.toHaveBeenCalled();
  });

  test('ignores messages outside linked channel', async () => {
    ensureGuildState.mockReturnValue({ linkedTextChannelId: 'linked' });
    await messageCreate({ log }, {
      author: { bot: false, id: 'user' },
      guildId: 'guild',
      channelId: 'other',
      content: 'hello',
    });
    expect(enqueueSpeech).not.toHaveBeenCalled();
  });

  test('ignores empty and oversized content', async () => {
    ensureGuildState.mockReturnValue({ linkedTextChannelId: 'linked' });
    for (const content of ['', '   ', 'x'.repeat(2001)]) {
      await messageCreate({ log }, { author: { bot: false, id: 'user' }, guildId: 'guild', channelId: 'linked', content });
    }
    expect(enqueueSpeech).not.toHaveBeenCalled();
  });

  test('assigns a voice and queues linked messages', async () => {
    const state = { linkedTextChannelId: 'linked', assignedUserOrder: [], assignedVoices: {} };
    ensureGuildState.mockReturnValue(state);
    hasSettings.mockResolvedValue(false);
    loadSettings.mockResolvedValue({ voice: 'coral' });
    const message = {
      author: { bot: false, id: 'user', tag: 'user#1' },
      guildId: 'guild',
      channelId: 'linked',
      content: ' hello ',
    };

    await messageCreate({ log }, message);

    expect(saveSettings).toHaveBeenCalledWith('guild', 'user', expect.objectContaining({ voice: expect.stringMatching(/^(alloy|ash|coral)$/) }));
    expect(enqueueSpeech).toHaveBeenCalledWith('guild', expect.objectContaining({ text: 'hello', userId: 'user', userTag: 'user#1', receivedAt: expect.any(Number) }));
  });
  test('handles rapid message bursts without dropping messages', async () => {
    const state = { linkedTextChannelId: 'linked', assignedUserOrder: [], assignedVoices: {} };
    ensureGuildState.mockReturnValue(state);
    hasSettings.mockResolvedValue(true);
    const messages = Array.from({ length: 20 }, (_, index) => ({
      author: { bot: false, id: 'user', tag: 'user#1' },
      guildId: 'guild',
      channelId: 'linked',
      content: `message ${index}`,
    }));

    for (const message of messages) await messageCreate({ log }, message);

    expect(enqueueSpeech).toHaveBeenCalledTimes(messages.length);
    expect(enqueueSpeech.mock.calls.map(([guildId, item]) => [guildId, item.text])).toEqual(messages.map((message) => ['guild', message.content]));
  });

});
