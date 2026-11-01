import { createServer } from 'node:http';
import { createHealthRequestHandler } from './health-routes.mjs';
import { createHealthReadiness } from './health-readiness.mjs';

export function createHealthServer({ port = 3040, host = '0.0.0.0' } = {}) {
  const readiness = createHealthReadiness();
  const server = createServer(createHealthRequestHandler(readiness.getReady));
  return {
    server,
    setReady: readiness.setReady,
    start() {
      return new Promise((resolve, reject) => {
        const onError = (error) => { server.removeListener('listening', onListening); reject(error); };
        const onListening = () => { server.removeListener('error', onError); resolve(server); };
        server.once('error', onError);
        server.once('listening', onListening);
        server.listen(port, host);
      });
    },
    stop() {
      if (!server.listening) return Promise.resolve();
      return new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    },
  };
}

