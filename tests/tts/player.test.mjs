import { EventEmitter } from 'node:events';
import { describe, expect, jest, test } from '@jest/globals';
import { createGuildAudioPlayer } from '../../src/tts/player.mjs';

describe('guild audio player', () => {
  test('sets voice behavior and logs player errors', () => {
    const player = new EventEmitter();
    const createPlayer = jest.fn(() => player);
    const log = { error: jest.fn() };
    expect(createGuildAudioPlayer({ guildId: 'guild', createPlayer, noSubscriberBehavior: 'pause', log })).toBe(player);
    expect(createPlayer).toHaveBeenCalledWith({ behaviors: { noSubscriber: 'pause', maxMissedFrames: 100 } });
    const error = new Error('player failed');
    player.emit('error', error);
    expect(log.error).toHaveBeenCalledWith('Discord audio player error for guild guild:', error);
  });
});
