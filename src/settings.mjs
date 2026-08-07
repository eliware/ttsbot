const settings = new Map();

function key(guildId, userId) {
  return `${guildId}:${userId}`;
}

export async function loadUserSettings(guildId, userId) {
  return { voice: 'coral', instructions: '', ...settings.get(key(guildId, userId)) };
}

export async function saveUserSettings(guildId, userId, value) {
  settings.set(key(guildId, userId), { ...value });
}

export async function userHasSettings(guildId, userId) {
  return settings.has(key(guildId, userId));
}
