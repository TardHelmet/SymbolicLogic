// Łukasiewicz's parenthesis-free notation (Copi, Symbolic Logic §9.4):
// operators written before their arguments, N for not, K for and, A for or,
// C for if … then, E for if and only if, and small letters for statements.
// No brackets are ever needed: CKpqr is (P • Q) ⊃ R, KpCqr is P • (Q ⊃ R).
//
// Statement letters A–Z of this course print as small letters, so that they
// cannot be confused with the operators.

import * as A from './ast.js';

const OP = { not: 'N', and: 'K', or: 'A', imp: 'C', iff: 'E' };
const TYPE = { N: 'not', K: 'and', A: 'or', C: 'imp', E: 'iff' };

export function printPolish(n) {
  switch (n.type) {
    case 'atom':
      if (n.terms.length) throw new Error('Polish notation here covers sentential formulas only.');
      return n.pred.toLowerCase();
    case 'meta': return n.name;
    case 'not': return `N${printPolish(n.arg)}`;
    case 'and': case 'or': case 'imp': case 'iff':
      return `${OP[n.type]}${printPolish(n.left)}${printPolish(n.right)}`;
    default: throw new Error(`Polish notation here has no sign for ${n.type}.`);
  }
}

/** Read a Polish formula. Small letters become the capital statement letters of this course. */
export function parsePolish(text) {
  const src = (text ?? '').replace(/\s+/g, '');
  if (!src) return { ok: false, error: { message: 'Nothing to read yet.', pos: 0, end: 0 } };
  let i = 0;
  const fail = (message) => { throw Object.assign(new Error(message), { polish: true, pos: i }); };
  const read = () => {
    if (i >= src.length) fail('The formula ends too soon: an operator is missing an argument.');
    const ch = src[i++];
    if (TYPE[ch]) {
      if (ch === 'N') return A.not(read());
      const l = read();
      const r = read();
      return A.binary(TYPE[ch], l, r);
    }
    if (/[a-z]/.test(ch) && ch !== 'v') return A.atom(ch.toUpperCase());
    return fail(`“${ch}” is not a Polish sign. Use N, K, A, C, E and small letters.`);
  };
  try {
    const ast = read();
    if (i < src.length) fail(`Something is left over after a complete formula: “${src.slice(i)}”.`);
    return { ok: true, ast };
  } catch (e) {
    if (e.polish) return { ok: false, error: { message: e.message, pos: e.pos, end: e.pos + 1 } };
    throw e;
  }
}
