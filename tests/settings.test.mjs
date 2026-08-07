import fs from 'node:fs/promises';
import { afterEach, describe, expect, test } from '@jest/globals';
import { ensureSettingsDir, loadUserSettings, saveUserSettings, settingsPath, userHasSettings } from '../src/settings.mjs';

const guildId = `test-guild-${process.pid}`;
const userId = `test-user-${process.pid}`;


afterEach(async () => {
  await fs.rm(settingsPath(guildId, userId), { force: true });
});

describe('settings', () => {
  test('ensures directory and returns defaults for missing settings', async () => {
    await ensureSettingsDir();
    expect(await loadUserSettings(guildId, userId)).toEqual({ voice: 'coral', instructions: '' });
    expect(await userHasSettings(guildId, userId)).toBe(false);
  });

  test('saves and loads user settings', async () => {
    const settings = { voice: 'marin', instructions: 'speak clearly' };
    await saveUserSettings(guildId, userId, settings);
    expect(await userHasSettings(guildId, userId)).toBe(true);
    expect(await loadUserSettings(guildId, userId)).toEqual(settings);
  });
});
