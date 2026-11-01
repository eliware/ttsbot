import { describe, expect, jest, test } from '@jest/globals';
import { createInteractionLogger } from '../../events/interaction-log.mjs';

describe('interaction logging', () => {
  test('logs ignored, received, unknown, and completed interaction details', () => {
    const log = { debug: jest.fn(), warn: jest.fn() };
    const logger = createInteractionLogger(log);
    const interaction = {
      type: 2, customId: 'custom', guildId: 'guild', channelId: 'channel',
      user: { id: 'user' }, commandName: 'voice',
    };
    logger.ignored(interaction);
    logger.received(interaction);
    logger.unknown(interaction);
    logger.completed(interaction);
    expect(log.debug).toHaveBeenCalledTimes(3);
    expect(log.warn).toHaveBeenCalledWith('Unknown Discord command', { command: 'voice' });
  });
});
