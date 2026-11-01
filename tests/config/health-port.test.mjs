import { describe, expect, test } from '@jest/globals';
import { getHealthPort } from '../../src/config/health-port.mjs';

describe('health port configuration', () => {
  test.each([
    [{ HEALTH_PORT: '3041' }, 3041],
    [{ HEALTH_PORT: '0' }, 0],
    [{}, 3040],
    [{ HEALTH_PORT: '' }, 3040],
    [{ HEALTH_PORT: 'invalid' }, 3040],
  ])('resolves %o to port %i', (environment, expected) => {
    expect(getHealthPort(environment)).toBe(expected);
  });
});
