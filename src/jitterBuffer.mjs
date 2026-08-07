import { Transform } from 'node:stream';

export function parseJitterBufferMs(value = process.env.TTS_JITTER_BUFFER_MS) {
  return Math.min(1000, Math.max(0, Number.parseInt(value || '200', 10) || 0));
}

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
