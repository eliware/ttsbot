import { describe, expect, test } from '@jest/globals';
import { isRetryableOpenAIError, openAIRetryDelay, shouldLogBufferUnderrun } from '../src/ttsPolicies.mjs';

 describe('TTS failure-path policies', () => {
  test('does not retry malformed or client-side OpenAI failures', () => {
    expect(isRetryableOpenAIError()).toBe(false);
    expect(isRetryableOpenAIError(null)).toBe(false);
    expect(isRetryableOpenAIError({})).toBe(false);
    expect(isRetryableOpenAIError({ status: 399 })).toBe(false);
    expect(isRetryableOpenAIError({ status: 499 })).toBe(false);
  });

  test('retries all server-side OpenAI failures', () => {
    expect(isRetryableOpenAIError({ status: 500 })).toBe(true);
    expect(isRetryableOpenAIError({ status: 599 })).toBe(true);
  });

  test('keeps retry delay deterministic for each attempt', () => {
    expect(openAIRetryDelay(0)).toBe(125);
    expect(openAIRetryDelay(1)).toBe(250);
    expect(openAIRetryDelay(3)).toBe(1000);
  });

  test('only reports underruns after playback starts', () => {
    expect(shouldLogBufferUnderrun(false)).toBe(false);
    expect(shouldLogBufferUnderrun(undefined)).toBe(false);
    expect(shouldLogBufferUnderrun(true)).toBe(true);
  });
});
