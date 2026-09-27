// Three-valued logics. Values are 1 (true), 0.5 (the third value) and 0
// (false). The logics differ in their tables and in which values count as
// "designated", the values an argument must preserve to be valid.
//
//   K3  strong Kleene: the third value is a gap (neither true nor false); designated {1}
//   LP  Priest's Logic of Paradox: the same tables, but the third value is a
//       glut (both true and false) and is designated; designated {1, ½}
//   WK  weak Kleene / Bochvar: the third value is "meaningless" and infects
//       any compound it touches; designated {1}
//   L3  Łukasiewicz: like K3, but ½ ⊃ ½ is true; designated {1}

import { children } from './ast.js';

export const LOGICS = {
  K3: { name: 'Strong Kleene (K3)', third: 'N', gloss: 'neither true nor false', designated: [1] },
  LP: { name: 'Logic of Paradox (LP)', third: 'B', gloss: 'both true and false', designated: [1, 0.5] },
  WK: { name: 'Weak Kleene (Bochvar)', third: 'M', gloss: 'meaningless', designated: [1] },
  L3: { name: 'Łukasiewicz (Ł3)', third: '½', gloss: 'indeterminate', designated: [1] },
};

export const VALUES = [1, 0.5, 0];

const strongImp = (a, b) => Math.max(1 - a, b);
const lukImp = (a, b) => Math.min(1, 1 - a + b);

function op(logic, type, a, b) {
  if (logic === 'WK' && (a === 0.5 || b === 0.5)) return 0.5;
  switch (type) {
    case 'not': return 1 - a;
    case 'and': return Math.min(a, b);
    case 'or': return Math.max(a, b);
    case 'imp': return logic === 'L3' ? lukImp(a, b) : strongImp(a, b);
    case 'iff': return logic === 'L3' ? 1 - Math.abs(a - b) : Math.min(strongImp(a, b), strongImp(b, a));
    default: throw new Error(`manyvalued: ${type} is not a sentential operator`);
  }
}

export function evaluate(logic, n, v) {
  if (!LOGICS[logic]) throw new Error(`Unknown logic ${logic}`);
  switch (n.type) {
    case 'atom':
      if (n.terms.length) throw new Error('manyvalued: predicate formulas are not supported');
      return v[n.pred];
    case 'meta':
      return v[n.name];
    case 'not':
      return op(logic, 'not', evaluate(logic, n.arg, v));
    default: {
      const [l, r] = children(n);
      if (!r) throw new Error(`manyvalued: ${n.type} is not supported`);
      return op(logic, n.type, evaluate(logic, l, v), evaluate(logic, r, v));
    }
  }
}

export const designated = (logic, x) => LOGICS[logic].designated.includes(x);

function names(n, out = new Set()) {
  if (n.type === 'atom' && !n.terms.length) out.add(n.pred);
  if (n.type === 'meta') out.add(n.name);
  for (const c of children(n)) names(c, out);
  return out;
}

export function lettersOf(formulas) {
  const s = new Set();
  for (const f of formulas) names(f, s);
  return [...s].sort();
}

/** All assignments of 1, ½, 0, in the order T, ½, F for each letter (first letter slowest). */
export function valuations(ls) {
  const rows = [];
  const n = ls.length;
  for (let i = 0; i < 3 ** n; i++) {
    const v = {};
    ls.forEach((l, j) => { v[l] = VALUES[Math.floor(i / 3 ** (n - 1 - j)) % 3]; });
    rows.push(v);
  }
  return rows;
}

export function table(logic, formulas) {
  const ls = lettersOf(formulas);
  return { letters: ls, rows: valuations(ls).map((v) => ({ v, values: formulas.map((f) => evaluate(logic, f, v)) })) };
}

export function validity(logic, premises, conclusion) {
  const ls = lettersOf([...premises, conclusion]);
  for (const v of valuations(ls)) {
    if (premises.every((p) => designated(logic, evaluate(logic, p, v))) && !designated(logic, evaluate(logic, conclusion, v))) {
      return { valid: false, counterexample: v };
    }
  }
  return { valid: true };
}

export function tautology(logic, f) {
  return validity(logic, [], f).valid;
}

/** Display a value in a logic's own labels: T, F and its third value. */
export function label(logic, x) {
  return x === 1 ? 'T' : x === 0 ? 'F' : LOGICS[logic].third;
}

export function showValuation(logic, v) {
  return Object.keys(v).sort().map((k) => `${k} = ${label(logic, v[k])}`).join(', ');
}
