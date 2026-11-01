import { createHealthRequestHandler } from './health-routes.mjs';
import { createHealthReadiness } from './health-readiness.mjs';
import { createHealthServerLifecycle } from './health-server-lifecycle.mjs';
import { createHealthHttpServer } from './health-server-factory.mjs';

export function createHealthServer({ port = 3040, host = '0.0.0.0' } = {}) {
  const readiness = createHealthReadiness();
  const server = createHealthHttpServer(createHealthRequestHandler(readiness.getReady));
  const lifecycle = createHealthServerLifecycle(server, { port, host });
  return {
    server,
    setReady: readiness.setReady,
    start: lifecycle.start,
    stop: lifecycle.stop,
  };
}

