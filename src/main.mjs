import { log, registerHandlers, registerSignals } from '@eliware/common';
import { logNodeWarning } from './warnings/logger.mjs';
import { hasRequiredSettings } from './config/required-settings.mjs';

// Suppress specific Node deprecation warnings (e.g. DEP0040 for the `punycode` module)
// Adding a warning listener prevents Node's default printing for warnings; we filter out DEP0040
process.on('warning', (warning) => logNodeWarning(warning, log));

registerHandlers({ events: ['uncaughtException', 'unhandledRejection'], log });

import { startDiscordClient } from './discordClient.mjs';
import { startHealthServer } from './config/health-startup.mjs';
import { getVoiceConnection } from '@discordjs/voice';
import { ensureGuildState } from './tts/state.mjs';
import { stopAndClear } from './tts/stop.mjs';
import { startDiscordApplication } from './application.mjs';

if (!hasRequiredSettings(process.env)) {
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
