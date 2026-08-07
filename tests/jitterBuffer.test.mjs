import { describe, expect, test } from '@jest/globals';
import { createJitterBuffer } from '../src/jitterBuffer.mjs';

describe('jitter buffer', () => {
  test('holds initial PCM until the configured buffer is primed', async () => {
    const buffer = createJitterBuffer();
    const chunks = [];
    buffer.on('data', (chunk) => chunks.push(chunk));
    buffer.write(Buffer.alloc(20_000));
    expect(chunks).toHaveLength(0);
    buffer.end(Buffer.alloc(20_000));
    await new Promise((resolve) => buffer.on('end', resolve));
    expect(Buffer.concat(chunks)).toHaveLength(40_000);
  });
});


test('flushes short audio and passes data after priming', async () => {
  const buffer = createJitterBuffer();
  const chunks = [];
  buffer.on('data', (chunk) => chunks.push(chunk));
  buffer.write(Buffer.alloc(40_000));
  buffer.write(Buffer.alloc(1_000));
  buffer.end();
  await new Promise((resolve) => buffer.on('end', resolve));
  expect(Buffer.concat(chunks)).toHaveLength(41_000);
});
