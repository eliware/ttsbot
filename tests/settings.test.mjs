import { afterEach, describe, expect, test } from '@jest/globals';
import { loadUserSettings, saveUserSettings, userHasSettings } from '../src/settings.mjs';

const guildId = `test-guild-${process.pid}`;
const userId = `test-user-${process.pid}`;

afterEach(async () => {
  // Each test uses a unique process-scoped key.
});

describe('settings', () => {
  test('returns defaults for missing settings', async () => {
    expect(await loadUserSettings(guildId, userId)).toEqual({ voice: 'coral' });
    expect(await userHasSettings(guildId, userId)).toBe(false);
  });

  test('saves and loads in-memory settings', async () => {
    const settings = { voice: 'alloy' };
    await saveUserSettings(guildId, userId, settings);
    expect(await userHasSettings(guildId, userId)).toBe(true);
    expect(await loadUserSettings(guildId, userId)).toEqual(settings);
  });
});
