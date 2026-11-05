import { createAudioPlayer, NoSubscriberBehavior } from "@discordjs/voice";
import { log as defaultLog } from "@eliware/common";

const MAX_MISSED_AUDIO_FRAMES = 500;

export function createGuildAudioPlayer({
  guildId,
  createPlayer = createAudioPlayer,
  noSubscriberBehavior = NoSubscriberBehavior.Pause,
  log = defaultLog,
}) {
  const player = createPlayer({
    behaviors: { noSubscriber: noSubscriberBehavior, maxMissedFrames: MAX_MISSED_AUDIO_FRAMES },
  });
  player.on("error", (error) =>
    log.error(`Discord audio player error for guild ${guildId}:`, error),
  );
  return player;
}
