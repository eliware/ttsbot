import { log as defaultLog } from '@eliware/common';

export async function preserveTextOnReplacementFailure(inputText, operation, logger = defaultLog) {
  try { return await operation(); }
  catch (error) {
    logger.error('Replacements error', error);
    return inputText;
  }
}
