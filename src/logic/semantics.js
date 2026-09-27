// Classical sentential semantics: valuations, truth tables, classification
// of statements, pairs, sets and arguments.

import { letters as lettersOf, isFirstOrder, hasModal, key, children } from './ast.js';

export function evaluate(n, v) {
  switch (n.type) {
    case 'atom':
      if (n.terms.length) throw new Error('evaluate: predicate formulas need a model');
      if (!(n.pred in v)) throw new Error(`evaluate: no value for ${n.pred}`);
      return v[n.pred];
    case 'meta':
      return v[n.name];
    case 'not': return !evaluate(n.arg, v);
    case 'and': return evaluate(n.left, v) && evaluate(n.right, v);
    case 'or': return evaluate(n.left, v) || evaluate(n.right, v);
    case 'imp': return !evaluate(n.left, v) || evaluate(n.right, v);
    case 'iff': return evaluate(n.left, v) === evaluate(n.right, v);
    default: throw new Error(`evaluate: ${n.type} is not truth-functional`);
  }
}

export function isSentential(n) {
  return !isFirstOrder(n) && !hasModal(n);
}

/** Statement letters across several formulas, alphabetised (Hurley's column order). */
export function lettersIn(formulas) {
  const all = new Set();
  for (const f of formulas) for (const l of lettersOf(f)) all.add(l);
  return [...all].sort();
}

/**
 * Valuations in Hurley's row order: the first letter's column is half T then
 * half F, the next alternates in quarters, and so on. Row 0 is all true.
 */
export function valuations(ls) {
  const n = ls.length;
  const rows = [];
  for (let i = 0; i < 2 ** n; i++) {
    const v = {};
    ls.forEach((l, j) => { v[l] = ((i >> (n - 1 - j)) & 1) === 0; });
    rows.push(v);
  }
  return rows;
}

export function truthTable(formulas) {
  const ls = lettersIn(formulas);
  const rows = valuations(ls).map((v) => ({ v, values: formulas.map((f) => evaluate(f, v)) }));
  return { letters: ls, rows };
}

/**
 * Compound subformulas in the order one computes them (innermost first),
 * without duplicates. These become the intermediate columns of a table.
 */
export function columns(n, out = [], seen = new Set()) {
  for (const c of children(n)) columns(c, out, seen);
  if (n.type !== 'atom' && n.type !== 'meta') {
    const k = key(n);
    if (!seen.has(k)) { seen.add(k); out.push(n); }
  }
  return out;
}

export function classifyStatement(n) {
  const { rows } = truthTable([n]);
  const vals = rows.map((r) => r.values[0]);
  if (vals.every(Boolean)) return 'tautologous';
  if (vals.every((x) => !x)) return 'self-contradictory';
  return 'contingent';
}

/**
 * Hurley's four relations between two statements. More than one can hold:
 * contradictory statements are also inconsistent, for example.
 */
export function relations(a, b) {
  const { rows } = truthTable([a, b]);
  const pairs = rows.map((r) => r.values);
  const out = [];
  if (pairs.every(([x, y]) => x === y)) out.push('equivalent');
  if (pairs.every(([x, y]) => x !== y)) out.push('contradictory');
  out.push(pairs.some(([x, y]) => x && y) ? 'consistent' : 'inconsistent');
  return out;
}

export function equivalence(a, b) {
  const { rows } = truthTable([a, b]);
  const diff = rows.find((r) => r.values[0] !== r.values[1]);
  return diff ? { equivalent: false, row: diff.v, values: diff.values } : { equivalent: true };
}

/** Joint consistency of a set of statements, with a witnessing row. */
export function consistency(formulas) {
  const { rows } = truthTable(formulas);
  const row = rows.find((r) => r.values.every(Boolean));
  return row ? { consistent: true, row: row.v } : { consistent: false };
}

/** Validity by full truth table; counterexamples are rows with true premises and a false conclusion. */
export function validity(premises, conclusion) {
  const { rows } = truthTable([...premises, conclusion]);
  const bad = rows.filter((r) => r.values.slice(0, -1).every(Boolean) && !r.values.at(-1));
  return { valid: bad.length === 0, counterexamples: bad.map((r) => r.v) };
}

export function entails(premises, conclusion) {
  return validity(premises, conclusion).valid;
}

/** Evaluate every premise and the conclusion at one assignment. */
export function checkRow(premises, conclusion, v) {
  return {
    premises: premises.map((p) => evaluate(p, v)),
    conclusion: evaluate(conclusion, v),
  };
}

/** Format a valuation as "A = T, B = F". */
export function showRow(v) {
  return Object.keys(v).sort().map((k) => `${k} = ${v[k] ? 'T' : 'F'}`).join(', ');
}

