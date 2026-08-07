import { userHasSettings, loadUserSettings, saveUserSettings } from '../src/settings.mjs';
import { AVAILABLE_VOICES } from '../src/discordActions.mjs';
import { ensureGuildState, enqueueSpeech } from '../src/ttsEngine.mjs';

export default async function ({ log }, message) {
  if (message.author.bot || !message.guildId) return;
  log.debug('messageCreate received', { guildId: message.guildId, channelId: message.channelId, messageId: message.id });
  const state = ensureGuildState(message.guildId);
  if (!state.linkedTextChannelId || message.channelId !== state.linkedTextChannelId) return;
  const content = message.content?.trim();
  if (!content || content.length > 2000) return;
  const userId = message.author.id;
  try {
    if (!await userHasSettings(message.guildId, userId)) {
      state.assignedUserOrder ??= [];
      state.assignedVoices ??= {};
      if (!state.assignedUserOrder.includes(userId)) state.assignedUserOrder.push(userId);
      const usage = new Map(AVAILABLE_VOICES.map((voice) => [voice, 0]));
      for (const voice of Object.values(state.assignedVoices)) usage.set(voice, (usage.get(voice) || 0) + 1);
      const leastUsed = Math.min(...usage.values());
      const candidates = AVAILABLE_VOICES.filter((voice) => usage.get(voice) === leastUsed);
      state.assignedVoices[userId] = candidates[Math.floor(Math.random() * candidates.length)];
      const settings = await loadUserSettings(message.guildId, userId);
      settings.voice = state.assignedVoices[userId];
      await saveUserSettings(message.guildId, userId, settings);
    }
  } catch (error) {
    log.error('Failed to assign user voice', error);
  }
  log.debug('messageCreate enqueueing TTS', { guildId: message.guildId, channelId: message.channelId, userId, length: content.length });
  await enqueueSpeech(message.guildId, { text: content, userId, userTag: message.author.tag, receivedAt: performance.now() });
}
