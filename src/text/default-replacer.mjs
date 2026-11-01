import { createReplacementLoader } from './loader.mjs';
import { createTextReplacer } from './replacer.mjs';

const loadReplacements = createReplacementLoader();
export const replaceText = createTextReplacer({ loadReplacements });
