import { describe, expect, jest, test } from '@jest/globals';
import { enqueueMessageForSpeech } from '../../src/discord/message-queue.mjs';

describe('message speech queue helper', () => {
  test('logs and queues normalized message content', async () => {
    const enqueueSpeech = jest.fn();
    const log = { debug: jest.fn() };
    await enqueueMessageForSpeech({
      enqueueSpeech, guildId: 'guild', channelId: 'text', content: 'hello', userId: 'user',
      userTag: 'user#1', log, receivedAt: 42,
    });
    expect(log.debug).toHaveBeenCalledWith('messageCreate enqueueing TTS', {
      guildId: 'guild', channelId: 'text', userId: 'user', length: 5,
    });
    expect(enqueueSpeech).toHaveBeenCalledWith('guild', {
      text: 'hello', userId: 'user', userTag: 'user#1', receivedAt: 42,
    });
  });
});
