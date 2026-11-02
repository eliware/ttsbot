import { recordSpeechResponseTiming } from "./timing.mjs";
import { logSpeechResponse } from "./log.mjs";

export function recordSpeechResponseMetrics({
  metrics,
  now,
  receivedAt,
  guildId,
  userId,
  hasBody,
  log,
}) {
  recordSpeechResponseTiming(metrics, now);
  logSpeechResponse({ log, metrics, receivedAt, guildId, userId, hasBody });
}
