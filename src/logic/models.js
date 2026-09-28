// Finite first-order models: evaluation, search for countermodels, and
// equivalence/validity checks with an honest certainty flag.
//
// A model is { size, consts: { a: 0 }, preds: { F: Set(['0']), R: Set(['0,1']) }, letters: { A: true } }.
// Individuals are 0..size-1 internally and 1..size when described to people.
//
// Completeness: for monadic formulas without identity, a model exists iff one
// exists whose individuals realise distinct "types" (sets of predicates), so
// enumerating realised type-sets is a decision procedure. With identity, per-
// type counts above the quantifier depth q make no difference, so counts
// 0..q suffice. Relational formulas have no finite bound in general: there
// the search is exhaustive only up to a small size and then random.

import * as A from './ast.js';
import { sameCanonical } from './normalize.js';

export function evaluate(n, m, env = {}) {
  const val = (t) => {
    if (t in env) return env[t];
    if (t in m.consts) return m.consts[t];
    throw new Error(`No value for ${t}`);
  };
  switch (n.type) {
    case 'atom':
      if (!n.terms.length) return !!m.letters?.[n.pred];
      return !!m.preds[n.pred]?.has(n.terms.map(val).join(','));
    case 'eq': return val(n.left) === val(n.right);
    case 'not': return !evaluate(n.arg, m, env);
    case 'and': return evaluate(n.left, m, env) && evaluate(n.right, m, env);
    case 'or': return evaluate(n.left, m, env) || evaluate(n.right, m, env);
    case 'imp': return !evaluate(n.left, m, env) || evaluate(n.right, m, env);
    case 'iff': return evaluate(n.left, m, env) === evaluate(n.right, m, env);
    case 'all':
    case 'some': {
      const saved = env[n.v];
      const had = n.v in env;
      let result = n.type === 'all';
      for (let d = 0; d < m.size; d++) {
        env[n.v] = d;
        const b = evaluate(n.body, m, env);
        if (n.type === 'all' && !b) { result = false; break; }
        if (n.type === 'some' && b) { result = true; break; }
      }
      if (had) env[n.v] = saved; else delete env[n.v];
      return result;
    }
    default:
      throw new Error(`models.evaluate: ${n.type} is not first-order`);
  }
}

export function signature(formulas) {
  const preds = new Map();
  const consts = new Set();
  const letters = new Set();
  let identity = false;
  let depth = 0;
  for (const f of formulas) {
    for (const [p, k] of A.predicates(f)) preds.set(p, k);
    for (const c of A.constants(f)) consts.add(c);
    for (const l of A.letters(f)) letters.add(l);
    identity ||= A.hasIdentity(f);
    depth = Math.max(depth, A.quantifierDepth(f));
  }
  return {
    preds: [...preds.entries()].sort(),
    consts: [...consts].sort(),
    letters: [...letters].sort(),
    identity,
    depth,
    monadic: [...preds.values()].every((k) => k <= 1),
  };
}

// --- enumeration helpers ----------------------------------------------------

function* setPartitions(items) {
  if (!items.length) { yield []; return; }
  const [first, ...rest] = items;
  for (const part of setPartitions(rest)) {
    for (let i = 0; i < part.length; i++) {
      yield [...part.slice(0, i), [first, ...part[i]], ...part.slice(i + 1)];
    }
    yield [[first], ...part];
  }
}

function bell(n) {
  let row = [1];
  for (let i = 0; i < n; i++) {
    const next = [row.at(-1)];
    for (const x of row) next.push(next.at(-1) + x);
    row = next;
  }
  return row[0];
}

function* valuationsOf(letters) {
  for (let i = 0; i < 2 ** letters.length; i++) {
    const v = {};
    letters.forEach((l, j) => { v[l] = ((i >> j) & 1) === 1; });
    yield v;
  }
}

function monadicCount(sig) {
  const T = 2 ** sig.preds.length;
  const cap = sig.identity ? Math.max(1, sig.depth) : 1;
  let parts = 0;
  for (const p of setPartitions(sig.consts)) parts += T ** p.length;
  return (cap + 1) ** T * Math.max(1, parts) * 2 ** sig.letters.length;
}

function* monadicModels(sig) {
  const names = sig.preds.map(([p]) => p);
  const T = 2 ** names.length;
  const cap = sig.identity ? Math.max(1, sig.depth) : 1;
  const counts = new Array(T).fill(0);
  const partitions = [...setPartitions(sig.consts)];
  for (;;) {
    for (const part of partitions) {
      const blockTypes = new Array(part.length).fill(0);
      for (;;) {
        const total = counts.reduce((a, b) => a + b, 0) + part.length;
        if (total > 0) {
          for (const letters of valuationsOf(sig.letters)) {
            const preds = Object.fromEntries(names.map((p) => [p, new Set()]));
            const consts = {};
            let d = 0;
            const place = (type) => {
              names.forEach((p, j) => { if ((type >> j) & 1) preds[p].add(String(d)); });
              return d++;
            };
            part.forEach((block, i) => {
              const e = place(blockTypes[i]);
              for (const c of block) consts[c] = e;
            });
            counts.forEach((k, type) => { for (let i = 0; i < k; i++) place(type); });
            yield { size: d, consts, preds, letters };
          }
        }
        let i = 0;
        while (i < blockTypes.length && ++blockTypes[i] === T) blockTypes[i++] = 0;
        if (i === blockTypes.length) break;
      }
    }
    let i = 0;
    while (i < T && ++counts[i] > cap) counts[i++] = 0;
    if (i === T) return;
  }
}

function bruteCount(sig, n) {
  let bits = 0;
  for (const [, k] of sig.preds) bits += n ** k;
  return 2 ** bits * n ** sig.consts.length * 2 ** sig.letters.length;
}

function tuples(n, k) {
  if (k === 0) return [[]];
  return tuples(n, k - 1).flatMap((t) => Array.from({ length: n }, (_, i) => [...t, i]));
}

function* bruteModels(sig, n) {
  const slots = sig.preds.flatMap(([p, k]) => tuples(n, k).map((t) => [p, t.join(',')]));
  const nc = sig.consts.length;
  for (let mask = 0; mask < 2 ** slots.length; mask++) {
    const preds = Object.fromEntries(sig.preds.map(([p]) => [p, new Set()]));
    slots.forEach(([p, key], j) => { if (Math.floor(mask / 2 ** j) % 2) preds[p].add(key); });
    for (let ci = 0; ci < n ** nc; ci++) {
      const consts = {};
      sig.consts.forEach((c, j) => { consts[c] = Math.floor(ci / n ** j) % n; });
      for (const letters of valuationsOf(sig.letters)) yield { size: n, consts, preds, letters };
    }
  }
}

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
}

function randomModel(sig, n, r) {
  const preds = {};
  for (const [p, k] of sig.preds) {
    preds[p] = new Set(tuples(n, k).filter(() => r() < 0.5).map((t) => t.join(',')));
  }
  const consts = Object.fromEntries(sig.consts.map((c) => [c, Math.floor(r() * n)]));
  const letters = Object.fromEntries(sig.letters.map((l) => [l, r() < 0.5]));
  return { size: n, consts, preds, letters };
}

/**
 * Search for a model satisfying test. Returns { model } if found, otherwise
 * { model: null, complete, upTo } where complete means no model exists.
 */
export function search(sig, test, { budget = 250000, samples = 3000 } = {}) {
  if (sig.monadic && monadicCount(sig) <= budget) {
    for (const m of monadicModels(sig)) if (test(m)) return { model: m };
    return { model: null, complete: true };
  }
  const quantFree = sig.depth === 0;
  let used = 0;
  let upTo = 0;
  for (let n = 1; n <= 8; n++) {
    const count = bruteCount(sig, n);
    if (used + count > budget) break;
    for (const m of bruteModels(sig, n)) if (test(m)) return { model: m };
    used += count;
    upTo = n;
    if (quantFree && n >= Math.max(1, sig.consts.length)) return { model: null, complete: true };
  }
  const r = rng(20250927);
  for (let i = 0; i < samples; i++) {
    const n = upTo + 1 + (i % 3);
    const m = randomModel(sig, n, r);
    if (test(m)) return { model: m };
  }
  return { model: null, complete: false, upTo };
}

export function compare(a, b) {
  if (A.equal(a, b) || sameCanonical(a, b)) return { equivalent: true, certainty: 'proved' };
  const sig = signature([a, b]);
  const res = search(sig, (m) => evaluate(a, m) !== evaluate(b, m));
  if (res.model) return { equivalent: false, model: res.model, values: [evaluate(a, res.model), evaluate(b, res.model)] };
  if (res.complete) return { equivalent: true, certainty: 'proved' };
  return {
    equivalent: null,
    certainty: 'provisional',
    note: `No difference in any situation with up to ${res.upTo} individuals, or in thousands of larger ones. Provisionally correct: compare your answer with the model answer.`,
  };
}

export function validity(premises, conclusion) {
  const sig = signature([...premises, conclusion]);
  const res = search(sig, (m) => premises.every((p) => evaluate(p, m)) && !evaluate(conclusion, m));
  if (res.model) return { valid: false, model: res.model };
  return { valid: true, certainty: res.complete ? 'proved' : 'provisional' };
}

export function satisfiable(formulas) {
  const sig = signature(formulas);
  const res = search(sig, (m) => formulas.every((f) => evaluate(f, m)));
  return res.model ? { satisfiable: true, model: res.model } : { satisfiable: false, certainty: res.complete ? 'proved' : 'provisional' };
}

// --- describing models in words --------------------------------------------

function listNames(xs) {
  if (!xs.length) return 'nothing';
  if (xs.length === 1) return xs[0];
  return `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`;
}

export function describeModel(m, dict = {}) {
  const ids = Array.from({ length: m.size }, (_, i) => String(i + 1));
  const parts = [`Take ${m.size === 1 ? 'a single individual, 1' : `${m.size} individuals, ${listNames(ids)}`}.`];
  for (const [c, d] of Object.entries(m.consts).sort()) {
    const gloss = dict[c] ? ` (${dict[c]})` : '';
    parts.push(`${c}${gloss} names ${d + 1}.`);
  }
  for (const [p, ext] of Object.entries(m.preds).sort()) {
    const gloss = dict[p] ? ` (“${dict[p]}”)` : '';
    const items = [...ext].sort().map((k) => (k.includes(',') ? `⟨${k.split(',').map((x) => +x + 1).join(', ')}⟩` : String(+k + 1)));
    const arity = [...ext][0]?.includes(',') ? 'relation' : '';
    const all = !arity && items.length === m.size && m.size > 1;
    parts.push(`${p}${gloss} holds of ${all ? 'every individual' : listNames(items)}${items.length === 1 && !all && m.size > 1 && !arity ? ' only' : ''}.`);
  }
  for (const [l, v] of Object.entries(m.letters ?? {}).sort()) {
    parts.push(`${l}${dict[l] ? ` (“${dict[l]}”)` : ''} is ${v ? 'true' : 'false'}.`);
  }
  return parts.join(' ');
}

export { bell };

/**
 * How two statements are related on the traditional square, given some
 * background assumptions (for example existential import, (∃x)Sx). Decided by
 * model search, which is complete for the monadic formulas the square uses.
 */
export function opposition(a, b, given = []) {
  const sat = (fs) => satisfiable([...given, ...fs]).satisfiable;
  const bothTrue = sat([a, b]);
  const bothFalse = sat([A.not(a), A.not(b)]);
  const aNotB = sat([a, A.not(b)]);
  const bNotA = sat([A.not(a), b]);
  if (!aNotB && !bNotA) return 'equivalent';
  if (!bothTrue && !bothFalse) return 'contradictory';
  if (!bothTrue) return 'contrary';
  if (!bothFalse) return 'subcontrary';
  if (!aNotB) return 'the first implies the second';
  if (!bNotA) return 'the second implies the first';
  return 'independent';
}

/** Check a student-built model against a goal. */
export function checkModel(model, { premises = [], conclusion = null, formulas = [] }) {
  const results = [];
  for (const p of premises) results.push({ f: p, role: 'premise', value: evaluate(p, model), want: true });
  if (conclusion) results.push({ f: conclusion, role: 'conclusion', value: evaluate(conclusion, model), want: false });
  for (const f of formulas) results.push({ f, role: 'formula', value: evaluate(f, model), want: true });
  return { ok: results.every((r) => r.value === r.want), results };
}
