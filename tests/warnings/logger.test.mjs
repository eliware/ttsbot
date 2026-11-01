import { describe, expect, jest, test } from '@jest/globals';
import { logNodeWarning } from '../../src/warnings/logger.mjs';

describe('Node warning logger', () => {
  test('suppresses filtered warnings', () => {
    const log = { warn: jest.fn() };
    logNodeWarning({ code: 'DEP0040', name: 'DeprecationWarning', message: 'punycode' }, log);
    expect(log.warn).not.toHaveBeenCalled();
  });

  test('logs warnings with and without codes', () => {
    const log = { warn: jest.fn() };
    logNodeWarning({ code: 'OTHER', name: 'Warning', message: 'details' }, log);
    logNodeWarning({ name: 'Warning', message: 'details' }, log);
    expect(log.warn).toHaveBeenNthCalledWith(1, 'Warning (OTHER): details');
    expect(log.warn).toHaveBeenNthCalledWith(2, 'Warning: details');
  });
});
