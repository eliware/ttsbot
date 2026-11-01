import { ensureGuildState } from '../src/tts/state.mjs';
import { enqueueSpeech } from '../src/tts/queue.mjs';
import { createVoiceAssigner } from '../src/tts/voice-assignment.mjs';

const assignVoice = createVoiceAssigner();

export default async function ({ log }, message) {
  if (message.author.bot || !message.guildId) return;
  log.debug('messageCreate received', { guildId: message.guildId, channelId: message.channelId, messageId: message.id });
  const state = ensureGuildState(message.guildId);
  if (!state.linkedTextChannelId || message.channelId !== state.linkedTextChannelId) return;
  const content = message.content?.trim();
  if (!content || content.length > 2000) return;
  const userId = message.author.id;
  try {
    await assignVoice(message.guildId, userId, state);
  } catch (error) {
    log.error('Failed to assign user voice', error);
  }
  log.debug('messageCreate enqueueing TTS', { guildId: message.guildId, channelId: message.channelId, userId, length: content.length });
  await enqueueSpeech(message.guildId, { text: content, userId, userTag: message.author.tag, receivedAt: performance.now() });
}
