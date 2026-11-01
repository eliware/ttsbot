import { log as defaultLog } from '@eliware/common';
import { getHealthPort, getListeningHealthPort } from './health-port.mjs';
import { logHealthServerListening } from './health-startup-log.mjs';
import { startConfiguredHealthServer } from './server-startup.mjs';

export async function startHealthServer({ log = defaultLog } = {}) {
  const port = getHealthPort();
  const health = await startConfiguredHealthServer(port);
  const listeningPort = getListeningHealthPort(health.server, port);
  logHealthServerListening({ log, port: listeningPort });
  return health;
}
