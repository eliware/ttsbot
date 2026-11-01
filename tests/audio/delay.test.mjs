import { describe, expect, test } from '@jest/globals';
import { sleep } from '../../src/audio/delay.mjs';

describe('audio delay', () => {
  test('resolves after the requested delay', async () => {
    await expect(sleep(0)).resolves.toBeUndefined();
  });
});
