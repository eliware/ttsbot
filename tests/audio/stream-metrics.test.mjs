import { EventEmitter } from 'node:events';
import { describe, expect, test } from '@jest/globals';
import { attachAudioByteCounter } from '../../src/audio/stream-metrics/byte-counter.mjs';

describe('audio stream metrics', () => {
  test('counts source audio bytes', () => {
    const source = new EventEmitter();
    const getAudioBytes = attachAudioByteCounter(source);
    source.emit('data', Buffer.alloc(2));
    source.emit('data', Buffer.alloc(3));
    expect(getAudioBytes()).toBe(5);
    expect(getAudioBytes()).toBe(5);
  });
});
