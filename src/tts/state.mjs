import { createGuildAudioPlayer } from './player.mjs';

const guildStates = new Map();

export function ensureGuildState(guildId) {
  if (!guildStates.has(guildId)) {
    guildStates.set(guildId, {
      connection: null, player: createGuildAudioPlayer({ guildId }), queue: [], playing: false,
      linkedTextChannelId: null, current: null,
    });
  }
  return guildStates.get(guildId);
}
