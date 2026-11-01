import { createAudioPlayer, NoSubscriberBehavior } from '@discordjs/voice';
import { log as defaultLog } from '@eliware/common';

export function createGuildAudioPlayer({
  guildId,
  createPlayer = createAudioPlayer,
  noSubscriberBehavior = NoSubscriberBehavior.Pause,
  log = defaultLog,
}) {
  const player = createPlayer({ behaviors: { noSubscriber: noSubscriberBehavior, maxMissedFrames: 100 } });
  player.on('error', (error) => log.error(`Discord audio player error for guild ${guildId}:`, error));
  return player;
}
