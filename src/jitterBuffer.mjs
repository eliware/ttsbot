import { Transform } from 'node:stream';
import { parseJitterBufferMs } from './config/jitter-buffer.mjs';

const JITTER_BUFFER_MS = parseJitterBufferMs();
const PCM_BYTES_PER_SECOND = 48_000 * 2 * 2;

export function createJitterBuffer() {
  const targetBytes = Math.round(PCM_BYTES_PER_SECOND * JITTER_BUFFER_MS / 1000);
  let buffered = Buffer.alloc(0);
  let primed = targetBytes === 0;
  return new Transform({
    transform(chunk, _encoding, callback) {
      if (primed) {
        this.push(chunk);
        callback();
        return;
      }
      buffered = Buffer.concat([buffered, chunk]);
      if (buffered.length >= targetBytes) {
        primed = true;
        this.push(buffered);
        buffered = Buffer.alloc(0);
      }
      callback();
    },
    flush(callback) {
      if (buffered.length) this.push(buffered);
      callback();
    },
  });
}

export { parseJitterBufferMs } from './config/jitter-buffer.mjs';
