import { afterEach, describe, expect, jest, test } from '@jest/globals';

const log = { info: jest.fn() };
jest.unstable_mockModule('@eliware/common', () => ({ log }));
const { startHealthServer } = await import('../../src/config/health-startup.mjs');

describe('health server startup', () => {
  let health;
  afterEach(async () => {
    if (health) await health.stop();
    health = null;
  });

  test('starts on the configured port and logs the address', async () => {
    const previous = process.env.HEALTH_PORT;
    process.env.HEALTH_PORT = '0';
    try {
      health = await startHealthServer({ log });
      const port = health.server.address().port;
      expect(port).toBeGreaterThan(0);
      expect(log.info).toHaveBeenCalledWith('Health server listening', { host: '0.0.0.0', port: 0 });
    } finally {
      if (previous === undefined) delete process.env.HEALTH_PORT;
      else process.env.HEALTH_PORT = previous;
    }
  });
});
