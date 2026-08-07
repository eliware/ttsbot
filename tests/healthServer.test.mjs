import { afterEach, describe, expect, jest, test } from '@jest/globals';

const log = { info: jest.fn() };
jest.unstable_mockModule('@eliware/common', () => ({ log }));
const { createHealthServer, startHealthServer } = await import('../src/healthServer.mjs');

const healthServers = [];
afterEach(async () => {
  await Promise.all(healthServers.splice(0).map((health) => health.stop()));
});

async function start() {
  const health = createHealthServer({ port: 0 });
  healthServers.push(health);
  await health.start();
  return health;
}

async function request(server, path) {
  const address = server.address();
  return fetch(`http://127.0.0.1:${address.port}${path}`);
}

describe('health server', () => {
  test('reports liveness, readiness, and unknown routes', async () => {
    const health = await start();
    expect((await request(health.server, '/health')).status).toBe(200);
    expect((await request(health.server, '/ready')).status).toBe(503);
    expect((await request(health.server, '/unknown')).status).toBe(404);
    health.setReady(true);
    expect((await request(health.server, '/ready')).status).toBe(200);
    health.setReady(false);
    expect((await request(health.server, '/ready')).status).toBe(503);
  });

  test('starts using HEALTH_PORT', async () => {
    const previous = process.env.HEALTH_PORT;
    process.env.HEALTH_PORT = '0';
    const health = await startHealthServer();
    healthServers.push(health);
    expect((await request(health.server, '/health')).status).toBe(200);
    if (previous === undefined) delete process.env.HEALTH_PORT;
    else process.env.HEALTH_PORT = previous;
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
    const defaults = createHealthServer();
    expect(defaults.server).toBeDefined();
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

  test('uses port 8080 when HEALTH_PORT is unset', async () => {
    const previous = process.env.HEALTH_PORT;
    delete process.env.HEALTH_PORT;
    const health = await startHealthServer();
    healthServers.push(health);
    expect(health.server.address().port).toBe(8080);
    if (previous === undefined) delete process.env.HEALTH_PORT;
    else process.env.HEALTH_PORT = previous;
  });

  test('uses the default port when HEALTH_PORT is invalid', async () => {
    const previous = process.env.HEALTH_PORT;
    process.env.HEALTH_PORT = 'invalid';
    const health = await startHealthServer();
    healthServers.push(health);
    expect((await request(health.server, '/health')).status).toBe(200);
    if (previous === undefined) delete process.env.HEALTH_PORT;
    else process.env.HEALTH_PORT = previous;
  });

  test('stop is safe before start', async () => {
    const health = createHealthServer({ port: 0 });
    await expect(health.stop()).resolves.toBeUndefined();
  });
});
