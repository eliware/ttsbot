import { describe, expect, jest, test } from '@jest/globals';
import { validateSpeechResponse } from '../../src/audio/response.mjs';

const base = () => ({
  signal: new AbortController().signal,
  receivedAt: 50,
  metrics: { requestStartedAt: 10 },
  now: () => 30,
  guildId: 'guild',
  userId: 'user',
  log: { debug: jest.fn(), error: jest.fn() },
});

describe('speech response validation', () => {
  test('converts a Web body and records response timing', () => {
    const deps = base();
    const body = new ReadableStream({ start(controller) { controller.close(); } });
    const result = validateSpeechResponse({ ...deps, result: { response: { body } } });
    expect(typeof result.source.pipe).toBe('function');
    expect(deps.metrics.responseReceivedAt).toBe(30);
  });

  test('stops for failed results, missing bodies, and nonstreamable bodies', () => {
    const deps = base();
    expect(validateSpeechResponse({ ...deps, result: { failed: true } })).toBeNull();
    expect(validateSpeechResponse({ ...deps, result: { response: {} } })).toBeNull();
    expect(validateSpeechResponse({ ...deps, result: { response: { body: {} } } })).toBeNull();
    expect(deps.log.error).toHaveBeenCalledTimes(2);
  });

  test('cancels an aborted response body', () => {
    const deps = base();
    const cancel = jest.fn();
    const controller = new AbortController();
    controller.abort();
    const result = validateSpeechResponse({ ...deps, signal: controller.signal, result: { response: { body: { cancel } } } });
    expect(result).toBeNull();
    expect(cancel).toHaveBeenCalled();
  });
});
