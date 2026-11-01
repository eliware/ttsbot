import { log, registerHandlers, registerSignals } from '@eliware/common';

// Suppress specific Node deprecation warnings (e.g. DEP0040 for the `punycode` module)
// Adding a warning listener prevents Node's default printing for warnings; we filter out DEP0040
process.on('warning', (warning) => {
  try {
    if (warning && warning.code === 'DEP0040') return; // ignore punycode deprecation
  } catch {}
  // For other warnings, print a concise message
  log.warn(`${warning.name}${warning.code ? ' (' + warning.code + ')' : ''}: ${warning.message}`);
});

registerHandlers({ events: ['uncaughtException', 'unhandledRejection'], log });

import { startDiscordClient } from './discordClient.mjs';
import { startHealthServer } from './healthServer.mjs';
import { getVoiceConnection } from '@discordjs/voice';
import { ensureGuildState, stopAndClear } from './ttsEngine.mjs';
import { startDiscordApplication } from './application.mjs';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!DISCORD_CLIENT_ID || !DISCORD_TOKEN || !OPENAI_API_KEY) {
  log.error('Missing DISCORD_CLIENT_ID, DISCORD_TOKEN, or OPENAI_API_KEY in environment. See .env.example');
  process.exit(1);
}

log.info('TTS POC starting...');
await startDiscordApplication({
  startDiscordClient,
  startHealthServer,
  registerSignals,
  getVoiceConnection,
  ensureGuildState,
  stopAndClear,
  log,
}).catch((error) => {
  log.error('Failed to start Discord client', error);
  process.exitCode = 1;
});
