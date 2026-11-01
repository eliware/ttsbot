import { describe, expect, jest, test } from '@jest/globals';
import { isRetryableOpenAIError, openAIRetryDelay } from '../../src/ttsPolicies.mjs';
import { requestSpeech } from '../../src/audio/openai-request.mjs';

describe('OpenAI retry policy', () => {
  test('retries rate limits and server failures only', () => {
    expect(isRetryableOpenAIError({ status: 429 })).toBe(true);
    expect(isRetryableOpenAIError({ status: 500 })).toBe(true);
    expect(isRetryableOpenAIError({ status: 503 })).toBe(true);
    expect(isRetryableOpenAIError({ status: 599 })).toBe(true);
    expect(isRetryableOpenAIError({ status: 400 })).toBe(false);
    expect(isRetryableOpenAIError({ status: 401 })).toBe(false);
    expect(isRetryableOpenAIError({ status: 399 })).toBe(false);
    expect(isRetryableOpenAIError({ status: 499 })).toBe(false);
    expect(isRetryableOpenAIError(new Error('network failure'))).toBe(false);
    expect(isRetryableOpenAIError()).toBe(false);
    expect(isRetryableOpenAIError(null)).toBe(false);
    expect(isRetryableOpenAIError({})).toBe(false);
  });

  test('uses exponential backoff', () => {
    expect(openAIRetryDelay(0)).toBe(125);
    expect(openAIRetryDelay(1)).toBe(250);
    expect(openAIRetryDelay(2)).toBe(500);
    expect(openAIRetryDelay(3)).toBe(1000);
  });
});

describe('OpenAI speech request', () => {
  test('retries a rate limit and returns a later response', async () => {
    const response = { body: 'audio' };
    const create = jest.fn().mockRejectedValueOnce({ status: 429 }).mockResolvedValue(response);
    const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };
    const sleep = jest.fn(async () => {});
    const signal = new AbortController().signal;

    await expect(requestSpeech({
      client: { audio: { speech: { create } } }, input: 'hello', voice: 'coral', signal,
      guildId: 'guild', userId: 'user', log, isRetryableOpenAIError, openAIRetryDelay, sleep,
    })).resolves.toEqual({ response });

    expect(create).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenNthCalledWith(1, expect.objectContaining({ model: 'tts-1', input: 'hello', voice: 'coral', signal }));
    expect(sleep).toHaveBeenCalledWith(250);
    expect(log.warn).toHaveBeenCalledWith('Retrying OpenAI TTS request', {
      guildId: 'guild', userId: 'user', attempt: 1, delayMs: 250, status: 429,
    });
  });

  test('stops after three retryable failures', async () => {
    const error = { status: 500 };
    const create = jest.fn().mockRejectedValue(error);
    const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };
    const sleep = jest.fn(async () => {});

    await expect(requestSpeech({
      client: { audio: { speech: { create } } }, input: 'hello', voice: 'coral',
      signal: new AbortController().signal, guildId: 'guild', userId: 'user',
      log, isRetryableOpenAIError, openAIRetryDelay, sleep,
    })).resolves.toEqual({ failed: true });

    expect(create).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls).toEqual([[250], [500]]);
    expect(log.error).toHaveBeenCalledWith('OpenAI TTS request error', error);
  });

  test('does not retry a non-retryable failure', async () => {
    const error = { status: 401 };
    const create = jest.fn().mockRejectedValue(error);
    const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };

    await expect(requestSpeech({
      client: { audio: { speech: { create } } }, input: 'hello', voice: 'coral',
      signal: new AbortController().signal, guildId: 'guild', userId: 'user',
      log, isRetryableOpenAIError, openAIRetryDelay, sleep: jest.fn(),
    })).resolves.toEqual({ failed: true });

    expect(create).toHaveBeenCalledTimes(1);
    expect(log.error).toHaveBeenCalledWith('OpenAI TTS request error', error);
  });

  test('stops retries when the request signal aborts', async () => {
    const controller = new AbortController();
    const create = jest.fn(() => {
      controller.abort();
      throw new Error('aborted');
    });
    const log = { debug: jest.fn(), error: jest.fn(), warn: jest.fn() };

    await expect(requestSpeech({
      client: { audio: { speech: { create } } }, input: 'hello', voice: 'coral',
      signal: controller.signal, guildId: 'guild', userId: 'user',
      log, isRetryableOpenAIError, openAIRetryDelay, sleep: jest.fn(),
    })).resolves.toEqual({ aborted: true });

    expect(create).toHaveBeenCalledTimes(1);
    expect(log.debug).toHaveBeenCalledWith('OpenAI TTS request aborted', { guildId: 'guild', userId: 'user' });
  });
});
