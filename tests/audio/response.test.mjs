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
  test('accepts an already streamable body', () => {
    const deps = base();
    const body = { pipe: jest.fn() };
    const result = validateSpeechResponse({ ...deps, result: { response: { body } } });
    expect(result.source).toBe(body);
    expect(deps.metrics.responseReceivedAt).toBe(30);
    expect(deps.log.debug).toHaveBeenCalledWith('OpenAI TTS response received', expect.objectContaining({ hasBody: true }));
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
