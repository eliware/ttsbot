import { createReplacementLoader } from './loader.mjs';
import { createTextReplacer } from './replacer.mjs';

export { applyReplacements, compileReplacements } from './rules.mjs';
export { createReplacementLoader } from './loader.mjs';
export { createTextReplacer } from './replacer.mjs';

const loadReplacements = createReplacementLoader();
export const replaceText = createTextReplacer({ loadReplacements });
