import { describe, expect, jest, test } from '@jest/globals';
import { createOpenAIClient } from '../../src/audio/client.mjs';

describe('OpenAI client factory', () => {
  test('creates and caches one client', () => {
    const client = {};
    const createClient = jest.fn(() => client);
    const getApiKey = jest.fn(() => 'test-key');
    const getClient = createOpenAIClient({ createClient, getApiKey });
    expect(getClient()).toBe(client);
    expect(getClient()).toBe(client);
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith({ apiKey: 'test-key' });
    expect(getApiKey).toHaveBeenCalledTimes(1);
  });
});
