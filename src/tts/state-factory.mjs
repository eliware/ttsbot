import { createGuildAudioPlayer } from './player.mjs';

export function createGuildState({ guildId, createPlayer = createGuildAudioPlayer }) {
  return {
    connection: null,
    player: createPlayer({ guildId }),
    queue: [],
    playing: false,
    linkedTextChannelId: null,
    current: null,
  };
}
