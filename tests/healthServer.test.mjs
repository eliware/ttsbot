import { afterEach, describe, expect, jest, test } from '@jest/globals';

const log = { info: jest.fn() };
jest.unstable_mockModule('@eliware/common', () => ({ log }));
const { createHealthServer } = await import('../src/healthServer.mjs');
const { startHealthServer } = await import('../src/config/health-startup.mjs');

const healthServers = [];
afterEach(async () => {
  await Promise.all(healthServers.splice(0).map((health) => health.stop()));
});

describe('health server', () => {
  test('starts on the configured port', async () => {
    const previous = process.env.HEALTH_PORT;
    process.env.HEALTH_PORT = '0';
    try {
      const health = await startHealthServer({ log });
      healthServers.push(health);
      const port = health.server.address().port;
      expect(port).toBeGreaterThan(0);
    } finally {
      if (previous === undefined) delete process.env.HEALTH_PORT;
      else process.env.HEALTH_PORT = previous;
    }
  });

  test('supports defaults and reports startup conflicts', async () => {
    const first = createHealthServer({ port: 0 });
    const second = createHealthServer({ port: 0 });
    await first.start();
    const port = first.server.address().port;
    const conflict = createHealthServer({ port });
    await expect(conflict.start()).rejects.toHaveProperty('code', 'EADDRINUSE');
    expect(second.server.listening).toBe(false);
    await first.stop();
  });

  test('propagates close errors', async () => {
    const health = createHealthServer({ port: 0 });
    await health.start();
    const close = health.server.close;
    health.server.close = (callback) => callback(new Error('close failed'));
    await expect(health.stop()).rejects.toThrow('close failed');
    health.server.close = close;
    await health.stop();
  });

  test('stop is safe before start', async () => {
    const health = createHealthServer({ port: 0 });
    await expect(health.stop()).resolves.toBeUndefined();
  });
});

