import { describe, expect, test } from '@jest/globals';
import { createJitterBuffer } from '../src/jitterBuffer.mjs';

describe('jitter buffer', () => {
  test('holds initial PCM until primed, then passes data and flushes all output', async () => {
    const buffer = createJitterBuffer();
    const chunks = [];
    buffer.on('data', (chunk) => chunks.push(chunk));
    buffer.write(Buffer.alloc(20_000));
    expect(chunks).toHaveLength(0);
    buffer.write(Buffer.alloc(20_000));
    buffer.end(Buffer.alloc(1_000));
    await new Promise((resolve) => buffer.on('end', resolve));
    expect(Buffer.concat(chunks)).toHaveLength(41_000);
  });

  test('flushes buffered audio when the stream ends before priming', async () => {
    const buffer = createJitterBuffer();
    const chunks = [];
    buffer.on('data', (chunk) => chunks.push(chunk));
    buffer.end(Buffer.alloc(1_000));
    await new Promise((resolve) => buffer.on('end', resolve));
    expect(Buffer.concat(chunks)).toHaveLength(1_000);
  });
});
