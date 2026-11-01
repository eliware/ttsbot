import { describe, expect, test } from '@jest/globals';
import { recordSpeechResponseTiming } from '../../src/audio/response-timing.mjs';

describe('speech response metrics', () => {
  test('records response timing', () => {
    const metrics = { requestStartedAt: 10 };
    recordSpeechResponseTiming(metrics, () => 30);
    expect(metrics.responseReceivedAt).toBe(30);
  });
});
