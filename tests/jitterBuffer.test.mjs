import { describe, expect, test } from '@jest/globals';
import { createJitterBuffer, parseJitterBufferMs } from '../src/jitterBuffer.mjs';

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


test('parses and clamps jitter buffer configuration', () => {
  expect(parseJitterBufferMs()).toBe(200);
  expect(parseJitterBufferMs('0')).toBe(0);
  expect(parseJitterBufferMs('500')).toBe(500);
  expect(parseJitterBufferMs('5000')).toBe(1000);
  expect(parseJitterBufferMs('-1')).toBe(0);
  expect(parseJitterBufferMs('invalid')).toBe(0);
});

test('flushes buffered audio when the stream ends before priming', async () => {
  const buffer = createJitterBuffer();
  const chunks = [];
  buffer.on('data', (chunk) => chunks.push(chunk));
  buffer.end(Buffer.alloc(1_000));
  await new Promise((resolve) => buffer.on('end', resolve));
  expect(Buffer.concat(chunks)).toHaveLength(1_000);
});
