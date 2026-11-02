import { recordSpeechResponseMetrics } from "./metrics.mjs";

export function observeSpeechResponse({ metrics, now, receivedAt, guildId, userId, hasBody, log }) {
  recordSpeechResponseMetrics({ metrics, now, receivedAt, guildId, userId, hasBody, log });
}
