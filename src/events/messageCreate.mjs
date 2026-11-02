import { ensureGuildState } from "../tts/state.mjs";
import { enqueueSpeech } from "../tts/queue.mjs";
import { createVoiceAssigner } from "../tts/voice/assignment.mjs";
import { normalizeMessageContent } from "../discord/message/content.mjs";
import { assignMessageVoice } from "../discord/message/voice.mjs";
import { enqueueMessageForSpeech } from "../discord/message/queue.mjs";

export default async function ({ log }, message) {
  if (message.author.bot || !message.guildId) return;
  log.debug("messageCreate received", {
    guildId: message.guildId,
    channelId: message.channelId,
    messageId: message.id,
  });
  const state = ensureGuildState(message.guildId);
  if (!state.linkedTextChannelId || message.channelId !== state.linkedTextChannelId) return;
  const content = normalizeMessageContent(message.content);
  if (!content) return;
  const userId = message.author.id;
  await assignMessageVoice({
    assignVoice: createVoiceAssigner(),
    guildId: message.guildId,
    userId,
    state,
    log,
  });
  await enqueueMessageForSpeech({
    enqueueSpeech,
    guildId: message.guildId,
    channelId: message.channelId,
    content,
    userId,
    userTag: message.author.tag,
    log,
  });
}
