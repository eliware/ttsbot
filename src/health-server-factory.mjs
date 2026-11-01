import { createServer } from 'node:http';

export function createHealthHttpServer(handler) {
  return createServer(handler);
}
