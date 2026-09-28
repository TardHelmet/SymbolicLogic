// Content markup that needs no DOM: finding and parsing the formulas that
// lesson text embeds as {…}. Shared by the renderer and the content tests.

import { parseFormula, parseArgument } from '../logic/parser.js';
import { LESSONS, PARTS } from './index.js';

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

/** Every {formula} in a piece of content text, except {!raw}, {@ref} and {%dots} ones. */
export function inlineFormulas(text) {
  const out = [];
  if (!text) return out;
  const re = /\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(text))) if (!/^[!@%]/.test(m[1])) out.push(m[1]);
  return out;
}

/** Every {%dots} formula in a piece of content text, without the braces and %. */
export function inlineDots(text) {
  const out = [];
  if (!text) return out;
  const re = /\{%([^}]+)\}/g;
  let m;
  while ((m = re.exec(text))) out.push(m[1]);
  return out;
}

/** Every {@ref} in a piece of content text, without the braces. */
export function inlineRefs(text) {
  const out = [];
  if (!text) return out;
  const re = /\{(@[^}]+)\}/g;
  let m;
  while ((m = re.exec(text))) out.push(m[1]);
  return out;
}

/**
 * Cross-references, so that numbers follow the course map:
 *   {@relations}      lesson 17
 *   {@^relations}     Lesson 17
 *   {@part:beyond}    Part IV
 * Returns { text, href } or null for an unknown id.
 */
export function resolveRef(src) {
  const m = /^@(\^?)(part:)?([a-z0-9-]+)$/.exec(src);
  if (!m) return null;
  if (m[2]) {
    const part = PARTS.find((p) => p.id === m[3]);
    return part ? { text: `Part ${part.numeral}`, href: `#/lesson/${part.lessons[0].id}` } : null;
  }
  const lesson = LESSONS.find((l) => l.id === m[3]);
  if (!lesson) return null;
  return { text: `${m[1] ? 'Lesson' : 'lesson'} ${lesson.number}`, href: `#/lesson/${lesson.id}` };
}
