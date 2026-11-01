import { requestSpeech } from "./retry.mjs";
import { validateSpeechResponse } from "./response.mjs";
import { isRetryableOpenAIError, openAIRetryDelay } from "../ttsPolicies.mjs";

export async function executeSpeechRequest({
  state,
  client,
  inputText,
  voice,
  receivedAt,
  guildId,
  userId,
  log,
  now,
  isRetryable = isRetryableOpenAIError,
  retryDelay = openAIRetryDelay,
  sleep,
}) {
  const controller = new AbortController();
  const current = { controller };
  state.current = current;
  const metrics = { receivedAt, requestStartedAt: now() };
  log.debug("OpenAI TTS request", {
    guildId,
    userId,
    voice,
    inputLength: inputText.length,
    model: "tts-1",
    responseFormat: "pcm",
  });
  const result = await requestSpeech({
    client,
    input: inputText,
    voice,
    signal: controller.signal,
    guildId,
    userId,
    log,
    isRetryableOpenAIError: isRetryable,
    openAIRetryDelay: retryDelay,
    sleep,
  });
  const audio = validateSpeechResponse({
    result,
    signal: controller.signal,
    receivedAt,
    metrics,
    now,
    guildId,
    userId,
    log,
  });
  if (!audio) {
    if (state.current === current) state.current = null;
    return null;
  }
  return { audio, current, metrics };
}
