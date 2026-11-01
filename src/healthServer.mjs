import { createServer } from 'node:http';
import { createHealthRequestHandler } from './health-routes.mjs';

export function createHealthServer({ port = 3040, host = '0.0.0.0' } = {}) {
  let ready = false;
  const server = createServer(createHealthRequestHandler(() => ready));
  return {
    server,
    setReady(value) { ready = value === true; },
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

