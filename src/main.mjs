import { log, registerHandlers, registerSignals } from "@eliware/common";
import { getVoiceConnection } from "@discordjs/voice";
import { registerNodeWarningListener } from "./warnings/listener.mjs";
import { hasRequiredSettings } from "./config/required-settings.mjs";
import { startDiscordClient } from "./discordClient.mjs";
import { startHealthServer } from "./config/health/startup.mjs";
import { ensureGuildState } from "./tts/state.mjs";
import { stopAndClear } from "./tts/stop.mjs";
import { startDiscordApplication } from "./application.mjs";

export async function startMain({
  env = process.env,
  logger = log,
  registerWarning = registerNodeWarningListener,
  registerErrorHandlers = registerHandlers,
  registerShutdownSignals = registerSignals,
  validateSettings = hasRequiredSettings,
  connectDiscord = startDiscordClient,
  startHealth = startHealthServer,
  getConnection = getVoiceConnection,
  ensureState = ensureGuildState,
  stopAudio = stopAndClear,
  startApplication = startDiscordApplication,
  exit = (code) => process.exit(code),
  setExitCode = (code) => {
    process.exitCode = code;
  },
} = {}) {
  registerWarning({ log: logger });
  registerErrorHandlers({ events: ["uncaughtException", "unhandledRejection"], log: logger });

  if (!validateSettings(env)) {
    logger.error(
      "Missing DISCORD_CLIENT_ID, DISCORD_TOKEN, or OPENAI_API_KEY in environment. See .env.example",
    );
    exit(1);
    return;
  }

  logger.info("TTS POC starting...");
  try {
    return await startApplication({
      startDiscordClient: connectDiscord,
      startHealthServer: startHealth,
      registerSignals: registerShutdownSignals,
      getVoiceConnection: getConnection,
      ensureGuildState: ensureState,
      stopAndClear: stopAudio,
      log: logger,
    });
  } catch (error) {
    logger.error("Failed to start Discord client", error);
    setExitCode(1);
  }
}
