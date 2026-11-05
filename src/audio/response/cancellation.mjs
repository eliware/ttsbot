import { cancelResponseBody } from "../../audioLifecycle.mjs";

export function cancelAbortedSpeechResponse({ response, signal, guildId, userId, log }) {
  if (!signal?.aborted) return false;
  log.debug("Discarding canceled OpenAI TTS response", { guildId, userId });
  cancelResponseBody(response?.body);
  return true;
}
