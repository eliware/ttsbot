import { describe, expect, test } from '@jest/globals';
import { hasRequiredSettings } from '../../src/config/required-settings.mjs';

describe('required settings validation', () => {
  test('requires the Discord ID, Discord token, and OpenAI key', () => {
    expect(hasRequiredSettings({ DISCORD_CLIENT_ID: 'id', DISCORD_TOKEN: 'token', OPENAI_API_KEY: 'key' })).toBe(true);
    expect(hasRequiredSettings({ DISCORD_CLIENT_ID: 'id', DISCORD_TOKEN: 'token' })).toBe(false);
    expect(hasRequiredSettings({ DISCORD_CLIENT_ID: '', DISCORD_TOKEN: 'token', OPENAI_API_KEY: 'key' })).toBe(false);
  });
});
