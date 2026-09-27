// Content markup that needs no DOM: finding and parsing the formulas that
// lesson text embeds as {…}. Shared by the renderer and the content tests.

import { parseFormula, parseArgument } from '../logic/parser.js';

const PARSE_ATTEMPTS = [
  (s) => parseFormula(s, { modal: true }),
  (s) => parseFormula(s, { schema: true, modal: true }),
  (s) => parseArgument(s, { modal: true }),
  (s) => parseArgument(s, { schema: true, modal: true }),
];

/** Parse a formula, schema, or argument written in content; null if none fits. */
export function parseAny(src) {
  for (const attempt of PARSE_ATTEMPTS) {
    const r = attempt(src);
    if (r.ok) return r;
  }
  return null;
}

/** Every {formula} in a piece of content text, except {!raw} ones. */
export function inlineFormulas(text) {
  const out = [];
  if (!text) return out;
  const re = /\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(text))) if (!m[1].startsWith('!')) out.push(m[1]);
  return out;
}
