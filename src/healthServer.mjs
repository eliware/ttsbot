import { createServer } from 'node:http';
import { log } from '@eliware/common';

export function createHealthServer({ port = 8080, host = '0.0.0.0' } = {}) {
  let ready = false;
  const server = createServer((request, response) => {
    if (request.url === '/health') {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ status: 'ok' }));
      return;
    }
    if (request.url === '/ready') {
      response.writeHead(ready ? 200 : 503, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ status: ready ? 'ready' : 'starting' }));
      return;
    }
    response.writeHead(404);
    response.end();
  });
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

export async function startHealthServer() {
  const port = Number.parseInt(process.env.HEALTH_PORT || '8080', 10);
  const health = createHealthServer({ port: Number.isFinite(port) ? port : 8080, host: '0.0.0.0' });
  await health.start();
  log.info('Health server listening', { host: '0.0.0.0', port: Number.isFinite(port) ? port : 8080 });
  return health;
}
