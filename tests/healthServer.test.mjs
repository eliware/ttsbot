import { afterEach, describe, expect, test } from '@jest/globals';
import { createHealthServer, startHealthServer } from '../src/healthServer.mjs';

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

  test('stop is safe before start', async () => {
    const health = createHealthServer({ port: 0 });
    await expect(health.stop()).resolves.toBeUndefined();
  });
});
