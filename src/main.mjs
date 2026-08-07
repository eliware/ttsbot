import dotenv from 'dotenv';
import { log, registerHandlers } from '@eliware/common';

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

// Load env quietly. dotenv supports `debug` which prints diagnostics when true; keep it false.
// Some wrappers print additional info; setting DEBUG env vars for dotenv-related libs can help,
// but here we ensure dotenv itself doesn't output debug logs.
dotenv.config({ quiet: true });

import { startDiscordClient } from './discordClient.mjs';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!DISCORD_CLIENT_ID || !DISCORD_TOKEN || !OPENAI_API_KEY) {
  log.error('Missing DISCORD_CLIENT_ID, DISCORD_TOKEN, or OPENAI_API_KEY in environment. See .env.example');
  process.exit(1);
}

(async () => {
  try {
    log.info('TTS POC starting...');
    await startDiscordClient();
  } catch (e) {
    log.error('Failed to start Discord client', e);
    process.exit(1);
  }
})();
