import fs from 'fs/promises';
import { path } from '@eliware/common';

export const SETTINGS_DIR = path(import.meta, '..', 'settings');

export async function ensureSettingsDir() {
  await fs.mkdir(SETTINGS_DIR, { recursive: true });
}

export function settingsPath(guildId, userId) {
  return path.join(SETTINGS_DIR, `${guildId}-${userId}.json`);
}

export async function loadUserSettings(guildId, userId) {
  try {
    const p = settingsPath(guildId, userId);
    const raw = await fs.readFile(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { voice: 'coral', instructions: '' };
  }
}

export async function saveUserSettings(guildId, userId, settings) {
  const p = settingsPath(guildId, userId);
  await fs.writeFile(p, JSON.stringify(settings, null, 2), 'utf8');
}

export async function userHasSettings(guildId, userId) {
  const p = settingsPath(guildId, userId);
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
