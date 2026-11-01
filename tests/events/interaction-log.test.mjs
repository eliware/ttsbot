import { describe, expect, jest, test } from '@jest/globals';
import { createInteractionLogger } from '../../events/interaction-log.mjs';

describe('interaction logging', () => {
  test('routes each log operation through its focused logger', () => {
    const log = { debug: jest.fn(), warn: jest.fn() };
    const logger = createInteractionLogger(log);
    const interaction = {
      type: 2, customId: 'custom', guildId: 'guild', channelId: 'channel',
      user: { id: 'user' }, commandName: 'voice',
    };
    expect(logger.ignored(interaction)).toBeUndefined();
    expect(logger.received(interaction)).toBeUndefined();
    expect(logger.unknown(interaction)).toBeUndefined();
    expect(logger.completed(interaction)).toBeUndefined();
    expect(log.debug).toHaveBeenCalledTimes(3);
    expect(log.warn).toHaveBeenCalledWith('Unknown Discord command', { command: 'voice' });
  });
});
