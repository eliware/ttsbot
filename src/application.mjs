import { cleanupGuildAudio } from "./application/audio-cleanup.mjs";
import { createApplicationShutdown } from "./application/shutdown.mjs";

export async function startDiscordApplication({
  startDiscordClient,
  startHealthServer,
  registerSignals,
  getVoiceConnection,
  ensureGuildState,
  stopAndClear,
  log,
}) {
  const health = await startHealthServer();
  let client;
  let discordShutdown;
  let startupPending = true;
  let finishStartup;
  const startupComplete = new Promise((resolve) => {
    finishStartup = resolve;
  });

  const { shutdown: shutdownApp, isShuttingDown } = createApplicationShutdown({
    health,
    startupComplete,
    isStartupPending: () => startupPending,
    getClient: () => client,
    getDiscordShutdown: () => discordShutdown,
    cleanupAudio: () =>
      cleanupGuildAudio({ client, stopAndClear, getVoiceConnection, ensureGuildState, log }),
    log,
  });

  try {
    registerSignals({ log, shutdownHook: shutdownApp });
    client = await startDiscordClient();
    discordShutdown = client.shutdown.bind(client);
    client.shutdown = shutdownApp;
    startupPending = false;
    finishStartup();
    if (isShuttingDown()) {
      await shutdownApp();
      return client;
    }
    health.setReady(true);
    return client;
  } catch (error) {
    startupPending = false;
    finishStartup();
    await shutdownApp();
    throw error;
  }
}
