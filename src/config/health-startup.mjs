import { log as defaultLog } from '@eliware/common';
import { getHealthPort } from './health-port.mjs';
import { createHealthServer } from '../healthServer.mjs';
import { logHealthServerListening } from './health-startup-log.mjs';

export async function startHealthServer({ log = defaultLog } = {}) {
  const port = getHealthPort();
  const health = createHealthServer({ port, host: '0.0.0.0' });
  await health.start();
  const address = health.server.address();
  const listeningPort = address && typeof address === 'object' ? address.port : port;
  logHealthServerListening({ log, port: listeningPort });
  return health;
}
