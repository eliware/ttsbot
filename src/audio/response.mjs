import { toNodeReadable } from "./stream/converter.mjs";
import { observeSpeechResponse } from "./response/observation.mjs";
import { cancelResponseBody } from "../audioLifecycle.mjs";
import { log as defaultLog } from "@eliware/common";

export function validateSpeechResponse({
  result,
  signal,
  receivedAt,
  metrics,
  now,
  guildId,
  userId,
  log = defaultLog,
}) {
  if (result.aborted || result.failed) return null;
  const response = result.response;
  observeSpeechResponse({
    metrics,
    now,
    receivedAt,
    guildId,
    userId,
    hasBody: Boolean(response?.body),
    log,
  });
  if (signal.aborted) {
    log.debug("Discarding canceled OpenAI TTS response", { guildId, userId });
    cancelResponseBody(response.body);
    return null;
  }
  if (!response?.body) {
    log.error("OpenAI TTS response did not include an audio body");
    return null;
  }
  const source = toNodeReadable(response.body);
  if (!source || typeof source.pipe !== "function") {
    log.error("OpenAI TTS response body is not streamable");
    cancelResponseBody(response.body);
    return null;
  }
  return { response, source };
}
