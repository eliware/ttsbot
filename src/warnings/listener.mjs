import { logNodeWarning } from './logger.mjs';

export function registerNodeWarningListener({ processObject = process, log }) {
  processObject.on('warning', (warning) => logNodeWarning(warning, log));
}
