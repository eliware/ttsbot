import { createReplacementLoader } from './loader.mjs';
import { createTextReplacer } from './replacer.mjs';

export { applyReplacements } from './applicator.mjs';
export { compileReplacements } from './compiler.mjs';
export { createReplacementLoader } from './loader.mjs';
export { createTextReplacer } from './replacer.mjs';

const loadReplacements = createReplacementLoader();
export const replaceText = createTextReplacer({ loadReplacements });
