import { describe, expect, jest, test } from '@jest/globals';
import { registerNodeWarningListener } from '../../src/warnings/listener.mjs';

describe('Node warning listener', () => {
  test('logs process warning events', () => {
    const listeners = new Map();
    const processObject = { on: jest.fn((event, listener) => listeners.set(event, listener)) };
    const log = { warn: jest.fn() };
    registerNodeWarningListener({ processObject, log });
    listeners.get('warning')({ name: 'Warning', message: 'details' });
    expect(processObject.on).toHaveBeenCalledWith('warning', expect.any(Function));
    expect(log.warn).toHaveBeenCalledWith('Warning: details');
  });
});
