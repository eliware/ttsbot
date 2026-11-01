import { createAudioPlayer, NoSubscriberBehavior } from '@discordjs/voice';
import { log } from '@eliware/common';

const guildStates = new Map();

function createGuildAudioPlayer(guildId) {
  const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause, maxMissedFrames: 100 } });
  player.on('error', (error) => log.error(`Discord audio player error for guild ${guildId}:`, error));
  return player;
}

export function ensureGuildState(guildId) {
  if (!guildStates.has(guildId)) {
    guildStates.set(guildId, {
      connection: null, player: createGuildAudioPlayer(guildId), queue: [], playing: false,
      linkedTextChannelId: null, current: null,
    });
  }
  return guildStates.get(guildId);
}
