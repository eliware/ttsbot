import { expect, jest, test } from "@jest/globals";
import { createApplicationShutdown } from "../../src/application/shutdown.mjs";

function makeShutdown({ client = {}, startupPending = false, healthError, discordError } = {}) {
  const health = {
    setReady: jest.fn(),
    stop: jest.fn(async () => {
      if (healthError) throw healthError;
    }),
  };
  const cleanupAudio = jest.fn();
  const shutdownDiscord = jest.fn(async () => {
    if (discordError) throw discordError;
  });
  const log = { warn: jest.fn() };
  const startupComplete = Promise.resolve();
  return {
    shutdown: createApplicationShutdown({
      health,
      startupComplete,
      isStartupPending: () => startupPending,
      getClient: () => client,
      getDiscordShutdown: () => shutdownDiscord,
      cleanupAudio,
      log,
    }),
    health,
    cleanupAudio,
    shutdownDiscord,
    log,
  };
}

test("shuts down once and waits for pending startup", async () => {
  const value = makeShutdown({ startupPending: true });
  const first = value.shutdown.shutdown();
  expect(value.shutdown.shutdown()).toBe(first);
  await first;
  expect(value.shutdown.isShuttingDown()).toBe(true);
  expect(value.health.setReady).toHaveBeenCalledWith(false);
  expect(value.cleanupAudio).toHaveBeenCalledTimes(1);
  expect(value.shutdownDiscord).toHaveBeenCalledTimes(1);
});

test("handles an absent client and shutdown failures", async () => {
  const healthError = new Error("health stop failed");
  const discordError = new Error("Discord stop failed");
  const value = makeShutdown({ client: null, healthError, discordError });
  await value.shutdown.shutdown();
  expect(value.log.warn).toHaveBeenCalledWith("Health server shutdown failed", healthError);
  expect(value.cleanupAudio).not.toHaveBeenCalled();
  expect(value.shutdownDiscord).not.toHaveBeenCalled();
});

test("logs Discord shutdown failures after audio cleanup", async () => {
  const error = new Error("Discord stop failed");
  const value = makeShutdown({ discordError: error });
  await value.shutdown.shutdown();
  expect(value.cleanupAudio).toHaveBeenCalled();
  expect(value.log.warn).toHaveBeenCalledWith("Discord shutdown failed", error);
});
