import { describe, expect, jest, test } from '@jest/globals';
import { logNodeWarning } from '../src/warnings.mjs';

describe('Node warning logging', () => {
  test('suppresses the known punycode deprecation', () => {
    const log = { warn: jest.fn() };
    logNodeWarning({ code: 'DEP0040', name: 'DeprecationWarning', message: 'punycode' }, log);
    expect(log.warn).not.toHaveBeenCalled();
  });

  test('logs other warnings with their code', () => {
    const log = { warn: jest.fn() };
    logNodeWarning({ code: 'OTHER', name: 'Warning', message: 'details' }, log);
    expect(log.warn).toHaveBeenCalledWith('Warning (OTHER): details');
  });

  test('logs warnings without a code', () => {
    const log = { warn: jest.fn() };
    logNodeWarning({ name: 'Warning', message: 'details' }, log);
    expect(log.warn).toHaveBeenCalledWith('Warning: details');
  });
});
