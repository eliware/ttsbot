import { createReplacementLoader } from './loader.mjs';
import { createTextReplacer } from './rules.mjs';

export { applyReplacements, compileReplacements, createTextReplacer } from './rules.mjs';
export { createReplacementLoader } from './loader.mjs';

const loadReplacements = createReplacementLoader();
export const replaceText = createTextReplacer({ loadReplacements });
