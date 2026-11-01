import { describe, expect, jest, test } from '@jest/globals';
import { logSpeechResponse } from '../../src/audio/response-log.mjs';

describe('speech response logging', () => {
  test('logs response timing details', () => {
    const log = { debug: jest.fn() };
    logSpeechResponse({
      log, metrics: { requestStartedAt: 10, responseReceivedAt: 30 }, receivedAt: 20,
      guildId: 'g', userId: 'u', hasBody: true,
    });
    expect(log.debug).toHaveBeenCalledWith('OpenAI TTS response received', {
      guildId: 'g', userId: 'u', hasBody: true, requestMs: 20, discordToOpenAIResponseMs: 10,
    });
  });
});
