import { ensureGuildState } from '../src/tts/state.mjs';
import { enqueueSpeech } from '../src/tts/queue.mjs';
import { createVoiceAssigner } from '../src/tts/voice-assignment.mjs';
import { normalizeMessageContent } from '../src/discord/message-content.mjs';
import { assignMessageVoice } from '../src/discord/message-voice.mjs';

export default async function ({ log }, message) {
  if (message.author.bot || !message.guildId) return;
  log.debug('messageCreate received', { guildId: message.guildId, channelId: message.channelId, messageId: message.id });
  const state = ensureGuildState(message.guildId);
  if (!state.linkedTextChannelId || message.channelId !== state.linkedTextChannelId) return;
  const content = normalizeMessageContent(message.content);
  if (!content) return;
  const userId = message.author.id;
  await assignMessageVoice({ assignVoice: createVoiceAssigner(), guildId: message.guildId, userId, state, log });
  log.debug('messageCreate enqueueing TTS', { guildId: message.guildId, channelId: message.channelId, userId, length: content.length });
  await enqueueSpeech(message.guildId, { text: content, userId, userTag: message.author.tag, receivedAt: performance.now() });
}
