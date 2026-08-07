import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const SETTINGS_DIR = path.join(__dirname, '..', 'settings');

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
  } catch (e) {
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
  } catch (e) {
    return false;
  }
}
