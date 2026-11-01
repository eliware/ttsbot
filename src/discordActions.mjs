import { createVoiceSettingsAction } from './discord/voice-settings.mjs';
import { createJoinAction } from './discord/join.mjs';
import { createLeaveAction } from './discord/leave.mjs';
import { createPlaybackActions } from './discord/playback.mjs';

export const AVAILABLE_VOICES = ['alloy', 'ash', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer'];

export function createDiscordActions({ log }) {
  const setVoice = createVoiceSettingsAction({ log });
  const join = createJoinAction({ log });
  const leave = createLeaveAction({ log });
  const playback = createPlaybackActions({ log });
  return {
    join,
    leave,
    voice: setVoice,
    ...playback,
  };
}
