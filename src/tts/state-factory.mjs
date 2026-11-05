import { createGuildAudioPlayer } from "./player.mjs";

export function createGuildState({ guildId, createPlayer = createGuildAudioPlayer }) {
  return {
    connection: null,
    player: createPlayer({ guildId }),
    queue: [],
    playing: false,
    stopping: false,
    queueGeneration: 0,
    processing: null,
    linkedTextChannelId: null,
    current: null,
  };
}
