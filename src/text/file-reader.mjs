import fs from 'node:fs/promises';
import { path } from '@eliware/common';

const REPLACEMENTS_PATH = path(import.meta, '..', '..', 'replacements.json');

export function createReplacementFileReader({ readFile = fs.readFile, filePath = REPLACEMENTS_PATH } = {}) {
  return () => readFile(filePath, 'utf8');
}
