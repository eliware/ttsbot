import { describe, expect, jest, test } from '@jest/globals';
import { logHealthServerListening } from '../../src/config/health-startup-log.mjs';

describe('health startup logger', () => {
  test('logs the bound port', () => {
    const log = { info: jest.fn() };
    logHealthServerListening({ log, port: 3040 });
    expect(log.info).toHaveBeenCalledWith('Health server listening', { host: '0.0.0.0', port: 3040 });
  });
});
