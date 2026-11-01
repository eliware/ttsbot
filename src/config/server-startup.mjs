import { createHealthServer } from '../healthServer.mjs';

export async function startConfiguredHealthServer(port, createServer = createHealthServer) {
  const health = createServer({ port, host: '0.0.0.0' });
  await health.start();
  return health;
}
