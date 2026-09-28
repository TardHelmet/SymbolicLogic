// Kripke models, for modal logic (□ and ◇) and for intuitionistic logic.
//
// A model is { worlds: ['1', '2'], R: Set(['1,2', ...]), V: { A: Set(['2']) } }.
// Modal logics are fixed by conditions on R:
//   K  none;  T  reflexive;  S4  reflexive and transitive;  S5  an equivalence.
// Intuitionistic models have reflexive, transitive R and persistent V: a
// letter true at a world stays true at every world accessible from it.
// Validity here is local: premises true at a world, conclusion true there.

import { children } from './ast.js';

export const FRAMES = {
  K: { name: 'K', conditions: [] },
  T: { name: 'T', conditions: ['reflexive'] },
  S4: { name: 'S4', conditions: ['reflexive', 'transitive'] },
  S5: { name: 'S5', conditions: ['reflexive', 'symmetric', 'transitive'] },
  INT: { name: 'intuitionistic', conditions: ['reflexive', 'transitive'], persistent: true },
};

const pair = (a, b) => `${a},${b}`;
export const sees = (m, a, b) => m.R.has(pair(a, b));
const succ = (m, w) => m.worlds.filter((v) => sees(m, w, v));

export function reflexive(m) { return m.worlds.every((w) => sees(m, w, w)); }
export function symmetric(m) { return m.worlds.every((a) => m.worlds.every((b) => !sees(m, a, b) || sees(m, b, a))); }
export function transitive(m) {
  return m.worlds.every((a) => m.worlds.every((b) => m.worlds.every((c) => !(sees(m, a, b) && sees(m, b, c)) || sees(m, a, c))));
}
export function persistent(m) {
  return Object.values(m.V).every((ws) => [...ws].every((w) => succ(m, w).every((v) => ws.has(v))));
}

const CHECKS = { reflexive, symmetric, transitive };

/** Frame conditions that fail, as words; empty when the model fits the logic. */
export function frameProblems(logic, m) {
  const f = FRAMES[logic];
  const out = f.conditions.filter((c) => !CHECKS[c](m));
  if (f.persistent && !persistent(m)) out.push('persistent');
  return out;
}

function letterTrue(m, name, w) {
  return !!m.V[name]?.has(w);
}

export function evaluate(n, m, w, mode = 'modal') {
  const ev = (x, at) => evaluate(x, m, at, mode);
  switch (n.type) {
    case 'atom':
      if (n.terms.length) throw new Error('kripke: predicate formulas are not supported');
      return letterTrue(m, n.pred, w);
    case 'meta':
      return letterTrue(m, n.name, w);
    case 'and': return ev(n.left, w) && ev(n.right, w);
    case 'or': return ev(n.left, w) || ev(n.right, w);
    case 'box': return succ(m, w).every((v) => ev(n.arg, v));
    case 'dia': return succ(m, w).some((v) => ev(n.arg, v));
    case 'not':
      return mode === 'int' ? succ(m, w).every((v) => !ev(n.arg, v)) : !ev(n.arg, w);
    case 'imp':
      return mode === 'int'
        ? succ(m, w).every((v) => !ev(n.left, v) || ev(n.right, v))
        : !ev(n.left, w) || ev(n.right, w);
    case 'iff':
      return mode === 'int'
        ? succ(m, w).every((v) => ev(n.left, v) === ev(n.right, v))
        : ev(n.left, w) === ev(n.right, w);
    default:
      throw new Error(`kripke: ${n.type} is not supported`);
  }
}

const modeOf = (logic) => (logic === 'INT' ? 'int' : 'modal');

export function truthAt(logic, f, m, w) {
  return evaluate(f, m, w, modeOf(logic));
}

function letters(n, out = new Set()) {
  if (n.type === 'atom' && !n.terms.length) out.add(n.pred);
  if (n.type === 'meta') out.add(n.name);
  for (const c of children(n)) letters(c, out);
  return out;
}

function* relations(ws, logic) {
  const pairs = ws.flatMap((a) => ws.map((b) => [a, b]));
  for (let mask = 0; mask < 2 ** pairs.length; mask++) {
    const R = new Set(pairs.filter((_, i) => (mask >> i) & 1).map(([a, b]) => pair(a, b)));
    const m = { worlds: ws, R, V: {} };
    if (FRAMES[logic].conditions.every((c) => CHECKS[c](m))) yield R;
  }
}

function* valuationsFor(ws, ls) {
  const slots = ls.flatMap((l) => ws.map((w) => [l, w]));
  for (let mask = 0; mask < 2 ** slots.length; mask++) {
    const V = Object.fromEntries(ls.map((l) => [l, new Set()]));
    slots.forEach(([l, w], i) => { if ((mask >> i) & 1) V[l].add(w); });
    yield V;
  }
}

/**
 * Look for a model of the logic, up to maxWorlds worlds, with a world where
 * every premise is true and the conclusion false.
 */
export function countermodel(logic, premises, conclusion, { maxWorlds = 3 } = {}) {
  const ls = [...letters(conclusion), ...premises.flatMap((p) => [...letters(p)])].filter((x, i, a) => a.indexOf(x) === i).sort();
  const mode = modeOf(logic);
  for (let n = 1; n <= maxWorlds; n++) {
    const ws = Array.from({ length: n }, (_, i) => String(i + 1));
    for (const R of relations(ws, logic)) {
      for (const V of valuationsFor(ws, ls)) {
        const m = { worlds: ws, R, V };
        if (FRAMES[logic].persistent && !persistent(m)) continue;
        for (const w of ws) {
          if (premises.every((p) => evaluate(p, m, w, mode)) && !evaluate(conclusion, m, w, mode)) return { model: m, world: w };
        }
      }
    }
  }
  return null;
}

export function validity(logic, premises, conclusion, opts) {
  const c = countermodel(logic, premises, conclusion, opts);
  return c ? { valid: false, ...c } : { valid: true };
}

/** Plain-language description of a Kripke model. */
export function describe(m, logic = 'K') {
  const arrows = m.worlds.flatMap((a) => m.worlds.filter((b) => sees(m, a, b)).map((b) => `${a}→${b}`));
  const vals = Object.keys(m.V).sort().map((l) => `${l} is true at ${m.V[l].size ? [...m.V[l]].sort().join(', ') : 'no world'}`);
  const reach = logic === 'INT' ? 'can grow into' : 'sees';
  return `Worlds ${m.worlds.join(', ')}; ${arrows.length ? `${reach}: ${arrows.join(', ')}` : 'no world sees any other'}; ${vals.join('; ')}.`;
}

/** Build a model from plain data: { worlds, R: [[a, b], ...], V: { A: [...] } }. */
export function fromData(d) {
  return {
    worlds: d.worlds.map(String),
    R: new Set((d.R ?? []).map(([a, b]) => pair(String(a), String(b)))),
    V: Object.fromEntries(Object.entries(d.V ?? {}).map(([k, ws]) => [k, new Set(ws.map(String))])),
  };
}

export function toData(m) {
  return {
    worlds: [...m.worlds],
    R: [...m.R].map((k) => k.split(',')),
    V: Object.fromEntries(Object.entries(m.V).map(([k, s]) => [k, [...s]])),
  };
}
