export function createApplicationShutdown({
  health, startupComplete, isStartupPending, getClient, getDiscordShutdown, cleanupAudio, log,
}) {
  let shuttingDown = false;
  let shutdownPromise;
  const shutdown = () => {
    shuttingDown = true;
    if (!shutdownPromise) {
      const waitForStartup = isStartupPending();
      shutdownPromise = (async () => {
        health.setReady(false);
        try {
          await health.stop();
        } catch (error) {
          log.warn('Health server shutdown failed', error);
        }
        if (waitForStartup) await startupComplete;
        if (!getClient()) return;
        await cleanupAudio();
        try {
          await getDiscordShutdown()();
        } catch (error) {
          log.warn('Discord shutdown failed', error);
        }
      })();
    }
    return shutdownPromise;
  };
  return { shutdown, isShuttingDown: () => shuttingDown };
}
