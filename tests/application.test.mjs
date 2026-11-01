import { describe, expect, jest, test } from '@jest/globals';
import { startDiscordApplication } from '../src/application.mjs';

function createHarness({ guildIds = ['guild-1'], startDiscordClient, healthStop, discordShutdown } = {}) {
  const order = [];
  const health = {
    setReady: jest.fn((ready) => order.push(`health.ready:${ready}`)),
    stop: jest.fn(async () => {
      order.push('health.stop');
      if (healthStop) throw healthStop;
    }),
  };
  const client = {
    guilds: { cache: new Map(guildIds.map((guildId) => [guildId, {}])) },
    shutdown: jest.fn(async () => {
      order.push('discord.shutdown');
      if (discordShutdown) throw discordShutdown;
    }),
  };
  const discordShutdownMock = client.shutdown;
  const states = new Map(guildIds.map((guildId) => [guildId, { connection: {} }]));
  const log = { error: jest.fn(), warn: jest.fn() };
  let shutdownHook;
  const dependencies = {
    startHealthServer: jest.fn(async () => {
      order.push('health.start');
      return health;
    }),
    startDiscordClient: startDiscordClient ?? jest.fn(async () => {
      order.push('discord.start');
      return client;
    }),
    registerSignals: jest.fn(({ shutdownHook: hook }) => {
      order.push('signals.register');
      shutdownHook = hook;
    }),
    getVoiceConnection: jest.fn(() => ({ destroy: jest.fn() })),
    ensureGuildState: jest.fn((guildId) => states.get(guildId)),
    stopAndClear: jest.fn(async (guildId) => order.push(`audio.stop:${guildId}`)),
    log,
  };
  return {
    client,
    discordShutdownMock,
    dependencies,
    health,
    log,
    order,
    states,
    getShutdownHook: () => shutdownHook,
  };
}

describe('Discord application lifecycle', () => {
  test('starts ready and shuts down services before the Discord client', async () => {
    const harness = createHarness();
    const client = await startDiscordApplication(harness.dependencies);

    expect(client).toBe(harness.client);
    expect(harness.order).toEqual(['health.start', 'signals.register', 'discord.start', 'health.ready:true']);
    expect(harness.dependencies.registerSignals).toHaveBeenCalledWith({
      log: harness.log,
      shutdownHook: expect.any(Function),
    });

    const firstShutdown = client.shutdown();
    expect(client.shutdown()).toBe(firstShutdown);
    await firstShutdown;

    expect(harness.order.slice(4)).toEqual([
      'health.ready:false',
      'health.stop',
      'audio.stop:guild-1',
      'discord.shutdown',
    ]);
    expect(harness.states.get('guild-1').connection).toBeNull();
  });

  test('continues voice cleanup after individual cleanup failures', async () => {
    const harness = createHarness({ guildIds: ['guild-1', 'guild-2'] });
    const stopError = new Error('audio stop failed');
    const voiceError = new Error('voice destroy failed');
    harness.dependencies.stopAndClear.mockImplementation(async (guildId) => {
      if (guildId === 'guild-1') throw stopError;
      harness.order.push(`audio.stop:${guildId}`);
    });
    harness.dependencies.getVoiceConnection.mockImplementation((guildId) => {
      if (guildId === 'guild-1') return { destroy: () => { throw voiceError; } };
      return null;
    });
    const client = await startDiscordApplication(harness.dependencies);

    await client.shutdown();

    expect(harness.log.error).toHaveBeenNthCalledWith(1, 'Failed to stop guild audio', stopError);
    expect(harness.log.error).toHaveBeenNthCalledWith(2, 'Failed to destroy voice connection', voiceError);
    expect(harness.states.get('guild-1').connection).toBeNull();
    expect(harness.states.get('guild-2').connection).toBeNull();
  });

  test('continues shutdown when guild state lookup fails', async () => {
    const harness = createHarness({ guildIds: ['guild-1', 'guild-2'] });
    const stateError = new Error('state lookup failed');
    harness.dependencies.ensureGuildState.mockImplementation((guildId) => {
      if (guildId === 'guild-1') throw stateError;
      return harness.states.get(guildId);
    });
    const client = await startDiscordApplication(harness.dependencies);
    await client.shutdown();
    expect(harness.log.error).toHaveBeenCalledWith('Failed to clear guild voice state', stateError);
    expect(harness.dependencies.getVoiceConnection).toHaveBeenCalledWith('guild-2');
    expect(harness.discordShutdownMock).toHaveBeenCalledTimes(1);
  });

  test('logs health and Discord shutdown failures and completes cleanup', async () => {
    const healthError = new Error('health stop failed');
    const discordError = new Error('Discord shutdown failed');
    const harness = createHarness({ healthStop: healthError, discordShutdown: discordError });
    const client = await startDiscordApplication(harness.dependencies);

    await expect(client.shutdown()).resolves.toBeUndefined();

    expect(harness.log.warn).toHaveBeenNthCalledWith(1, 'Health server shutdown failed', healthError);
    expect(harness.log.warn).toHaveBeenNthCalledWith(2, 'Discord shutdown failed', discordError);
    expect(harness.states.get('guild-1').connection).toBeNull();
  });

  test('cleans up the health server when Discord startup fails', async () => {
    const startupError = new Error('Discord startup failed');
    const harness = createHarness({ startDiscordClient: jest.fn(async () => { throw startupError; }) });

    await expect(startDiscordApplication(harness.dependencies)).rejects.toBe(startupError);

    expect(harness.health.setReady).toHaveBeenCalledWith(false);
    expect(harness.health.stop).toHaveBeenCalledTimes(1);
    expect(harness.discordShutdownMock).not.toHaveBeenCalled();
  });

  test('waits for startup before handling a signal', async () => {
    let resolveClient;
    let signalReady;
    const clientStarted = new Promise((resolve) => { signalReady = resolve; });
    const harness = createHarness({
      startDiscordClient: jest.fn(() => new Promise((resolve) => {
        resolveClient = resolve;
        signalReady();
      })),
    });
    const startup = startDiscordApplication(harness.dependencies);
    await clientStarted;
    const shutdown = harness.getShutdownHook()();
    await Promise.resolve();

    expect(harness.health.stop).toHaveBeenCalledTimes(1);
    expect(harness.discordShutdownMock).not.toHaveBeenCalled();
    resolveClient(harness.client);
    await expect(startup).resolves.toBe(harness.client);
    await shutdown;

    expect(harness.health.setReady).not.toHaveBeenCalledWith(true);
    expect(harness.discordShutdownMock).toHaveBeenCalledTimes(1);
  });

  test('propagates health server startup errors before registering signals', async () => {
    const startupError = new Error('health startup failed');
    const harness = createHarness();
    harness.dependencies.startHealthServer.mockRejectedValue(startupError);

    await expect(startDiscordApplication(harness.dependencies)).rejects.toBe(startupError);

    expect(harness.dependencies.registerSignals).not.toHaveBeenCalled();
    expect(harness.dependencies.startDiscordClient).not.toHaveBeenCalled();
  });
});
