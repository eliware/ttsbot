import { log as defaultLog } from '@eliware/common';
import { getHealthPort } from './health-port.mjs';
import { createHealthServer } from '../healthServer.mjs';

export async function startHealthServer({ log = defaultLog } = {}) {
  const port = getHealthPort();
  const health = createHealthServer({ port, host: '0.0.0.0' });
  await health.start();
  log.info('Health server listening', { host: '0.0.0.0', port });
  return health;
}
