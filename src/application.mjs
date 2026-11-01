import { cleanupGuildAudio } from './application/audio-cleanup.mjs';

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
  let shuttingDown = false;
  let shutdownPromise;
  let finishStartup;
  const startupComplete = new Promise((resolve) => {
    finishStartup = resolve;
  });

  const shutdownApp = () => {
    shuttingDown = true;
    if (!shutdownPromise) {
      const waitForStartup = startupPending;
      shutdownPromise = (async () => {
        health.setReady(false);
        try {
          await health.stop();
        } catch (error) {
          log.warn('Health server shutdown failed', error);
        }
        if (waitForStartup) await startupComplete;
        if (!client) return;
        await cleanupGuildAudio({ client, stopAndClear, getVoiceConnection, ensureGuildState, log });
        try {
          await discordShutdown();
        } catch (error) {
          log.warn('Discord shutdown failed', error);
        }
      })();
    }
    return shutdownPromise;
  };

  try {
    registerSignals({ log, shutdownHook: shutdownApp });
    client = await startDiscordClient();
    discordShutdown = client.shutdown.bind(client);
    client.shutdown = shutdownApp;
    startupPending = false;
    finishStartup();
    if (shuttingDown) {
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
