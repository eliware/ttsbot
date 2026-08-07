import { describe, expect, test } from '@jest/globals';
import { isRetryableOpenAIError, openAIRetryDelay } from '../src/ttsPolicies.mjs';

describe('OpenAI retry policy', () => {
  test('retries rate limits and server failures only', () => {
    expect(isRetryableOpenAIError({ status: 429 })).toBe(true);
    expect(isRetryableOpenAIError({ status: 500 })).toBe(true);
    expect(isRetryableOpenAIError({ status: 503 })).toBe(true);
    expect(isRetryableOpenAIError({ status: 400 })).toBe(false);
    expect(isRetryableOpenAIError({ status: 401 })).toBe(false);
    expect(isRetryableOpenAIError(new Error('network failure'))).toBe(false);
  });

  test('uses exponential backoff', () => {
    expect(openAIRetryDelay(1)).toBe(250);
    expect(openAIRetryDelay(2)).toBe(500);
    expect(openAIRetryDelay(3)).toBe(1000);
  });
});
