// Axiomatic (Hilbert-style) proofs: a few axioms, modus ponens, uniform
// substitution and definitions, and nothing else. This is the method of
// Principia Mathematica (as Langer presents it in ch. XII) and of the
// propositional calculus R.S. in Copi's Symbolic Logic (ch. 8), which he
// takes from Rosser.
//
// A line is justified by one of:
//   *1.3            an instance of an axiom (or of a theorem the exercise provides)
//   Sub 4           an instance of line 4 (uniform substitution)
//   Df 5            line 5 with defined signs written out or abbreviated
//   MP 3, 4         modus ponens (*1.1 in Principia, R1 in R.S.)
// Letters in axioms and earlier lines are variables: substituting formulas
// for them, the same formula for every occurrence, gives an instance.

import * as A from './ast.js';
import { parseFormula } from './parser.js';
import { print } from './printer.js';
import { match } from './match.js';
import { fitsImplication, rewriteCost } from './rules.js';
import { validity, showRow } from './semantics.js';

const F = (s) => parseFormula(s, { schema: true }).ast;

// Every letter (sentence letter or metavariable) becomes a metavariable.
export function schematize(n) {
  if (n.type === 'atom' && !n.terms.length) return A.meta(n.pred);
  if (n.type === 'meta') return n;
  const kids = A.children(n);
  return kids.length ? A.withChildren(n, kids.map(schematize)) : n;
}

const defs = (pairs) => pairs.map(([l, r]) => [schematize(F(l)), schematize(F(r))]);

const PM_AXIOMS = {
  '*1.2': { name: 'Taut', formula: '(p ∨ p) ⊃ p' },
  '*1.3': { name: 'Add', formula: 'q ⊃ (p ∨ q)' },
  '*1.4': { name: 'Perm', formula: '(p ∨ q) ⊃ (q ∨ p)' },
  '*1.5': { name: 'Assoc', formula: '[p ∨ (q ∨ r)] ⊃ [q ∨ (p ∨ r)]' },
  '*1.6': { name: 'Sum', formula: '(q ⊃ r) ⊃ [(p ∨ q) ⊃ (p ∨ r)]' },
};
const PM_DEFS = [['p ⊃ q', '~p ∨ q'], ['p • q', '~(~p ∨ ~q)'], ['p ≡ q', '(p ⊃ q) • (q ⊃ p)']];

export const SYSTEMS = {
  PM: {
    name: 'Principia Mathematica', primitives: '~ and ∨', mp: '*1.1',
    axioms: PM_AXIOMS,
    defs: PM_DEFS, defNames: ['*1.01', '*3.01', '*4.01'],
  },
  HA: {
    name: 'Hilbert and Ackermann’s system', primitives: '~ and ∨', mp: 'MP',
    axioms: Object.fromEntries(Object.entries(PM_AXIOMS).filter(([k]) => k !== '*1.5')),
    defs: PM_DEFS, defNames: ['*1.01', '*3.01', '*4.01'],
  },
  RS: {
    name: 'R.S. (Rosser, in Copi)', primitives: '~ and •', mp: 'R1',
    axioms: {
      'Ax. 1': { name: 'Axiom 1', formula: 'P ⊃ (P • P)' },
      'Ax. 2': { name: 'Axiom 2', formula: '(P • Q) ⊃ P' },
      'Ax. 3': { name: 'Axiom 3', formula: '(P ⊃ Q) ⊃ [~(Q • R) ⊃ ~(R • P)]' },
    },
    defs: [['p ⊃ q', '~(p • ~q)'], ['p ∨ q', '~(~p • ~q)'], ['p ≡ q', '(p ⊃ q) • (q ⊃ p)']],
    defNames: ['Df. ⊃', 'Df. ∨', 'Df. ≡'],
  },
};
for (const sys of Object.values(SYSTEMS)) {
  for (const ax of Object.values(sys.axioms)) ax.ast = schematize(F(ax.formula));
  sys.defPats = defs(sys.defs);
}

const norm = (s) => s.toLowerCase().replace(/[\s.*]/g, '');

/** Parse a justification: returns { kind: 'cite'|'sub'|'df'|'mp', id?, refs } or { error }. */
export function parseAxJustification(text, sys, theorems = {}) {
  const src = (text ?? '').trim();
  if (!src) return { error: 'Give a justification: an axiom (as “*1.3”), “Sub 4”, “Df 5” or “MP 3, 4”.' };
  // Cited axioms and theorems first: “*1.3”, “Ax. 1”, “*2.05”.
  const names = [...Object.keys(sys.axioms), ...Object.keys(theorems)];
  const cited = names.find((k) => norm(src) === norm(k) || norm(src) === norm(sys.axioms[k]?.name ?? ''));
  if (cited) return { kind: 'cite', id: cited, refs: [] };
  if (/^\s*(\*\s*\d+\.\d+|ax\.?\s*\d+)\s*$/i.test(src)) {
    return { error: `${src} is not an axiom of ${sys.name}${Object.keys(theorems).length ? ' or a theorem you may cite here' : ''}. Available: ${names.join(', ')}.` };
  }
  let rest = src;
  const mpNames = ['mp', 'modusponens', norm(sys.mp), 'r1', '*1.1', '11'];
  const refs = [];
  rest = rest.replace(/\*?\d+\.\d+/g, (m) => { if (norm(m) === norm(sys.mp)) return ' mp '; return m; });
  for (const m of rest.matchAll(/\b\d+\b/g)) refs.push(+m[0]);
  const word = norm(rest.replace(/\b\d+\b/g, ' ').replace(/[,;()]/g, ' '));
  if (!word) return { error: 'Name the rule: an axiom, Sub, Df or MP.' };
  if (/^(sub|subst|substitution)$/.test(word)) return { kind: 'sub', refs };
  if (/^(df|def|definition)/.test(word)) return { kind: 'df', refs };
  if (mpNames.includes(word)) return { kind: 'mp', refs };
  return { error: `“${src}” is not a rule of ${sys.name}. Use an axiom (${Object.keys(sys.axioms).join(', ')}), Sub, Df or MP.` };
}

const isInstance = (pattern, line) => match(pattern, line) !== null;

function checkLine(j, cited, target, ctx) {
  const { sys, theorems } = ctx;
  if (j.kind === 'cite') {
    const pat = sys.axioms[j.id]?.ast ?? theorems[j.id];
    if (isInstance(pat, target)) return [];
    return [`This is not an instance of ${j.id}, ${print(pat)}: substituting formulas for its letters, the same formula for every occurrence of a letter, never gives this line.${ctx.hintDf(pat, target)}`];
  }
  if (j.kind === 'sub') {
    if (cited.length !== 1) return ['Sub cites one line.'];
    const pat = schematize(cited[0]);
    if (isInstance(pat, target)) return A.equal(cited[0], target) ? ['This line is the same as the cited line.'] : [];
    return [`This is not a substitution instance of line ${ctx.citedNos[0]}. Substitution must put the same formula for every occurrence of a letter.${ctx.hintDf(pat, target)}`];
  }
  if (j.kind === 'df') {
    if (cited.length !== 1) return ['Df cites one line.'];
    const cost = rewriteCost(sys.defPats, cited[0], target);
    if (cost >= 1 && cost < Infinity) return [];
    if (cost === 0) return ['This line is the same as the cited line.'];
    return [`This does not come from line ${ctx.citedNos[0]} by writing out or abbreviating a defined sign (${sys.defs.map(([l, r]) => `${l} for ${r}`).join('; ')}).`];
  }
  if (j.kind === 'mp') {
    if (cited.length !== 2) return ['Modus ponens cites two lines: a conditional and its antecedent.'];
    if (fitsImplication('MP', cited, target)) return [];
    const cond = cited.find((c) => c.type === 'imp');
    if (!cond) return ['Neither cited line is a conditional written with ⊃. If it is written out (as ~p ∨ q), abbreviate it by Df first.'];
    return [`From ${print(cond)}, modus ponens needs its antecedent, ${print(cond.left)}, and gives ${print(cond.right)}.`];
  }
  return ['Unknown rule.'];
}

/**
 * Check an axiomatic proof. goal: formula (schema letters allowed); lines:
 * [{ text, just }]. options.system: 'PM' | 'HA' | 'RS'; options.theorems:
 * { '*2.05': 'formula', … } that may be cited like axioms.
 */
export function checkAxiomatic({ goal, lines }, options = {}) {
  const sys = SYSTEMS[options.system ?? 'PM'];
  const theorems = Object.fromEntries(Object.entries(options.theorems ?? {}).map(([k, v]) => [k, schematize(typeof v === 'string' ? F(v) : v)]));
  const hintDf = (pat, target) => {
    // If the line matches once the defined signs are written out, say so.
    const expanded = (n) => {
      let cur = n;
      for (let i = 0; i < 20; i++) {
        let changed = false;
        for (const [l, r] of sys.defPats) {
          const walk = (x) => {
            const s = match(l, x);
            if (s) { changed = true; return instantiateSafe(r, s) ?? x; }
            const k = A.children(x);
            return k.length ? A.withChildren(x, k.map(walk)) : x;
          };
          cur = walk(cur);
        }
        if (!changed) break;
      }
      return cur;
    };
    return isInstance(expanded(pat), expanded(target)) ? ' It would be, once the defined signs are written the same way: add a Df line.' : '';
  };
  const out = [];
  lines.forEach((ln, k) => {
    const n = k + 1;
    const info = { n, text: ln.text, just: ln.just ?? '', refs: [], errors: [], depth: 0, path: [] };
    out.push(info);
    const parsed = typeof ln.text === 'string' ? parseFormula(ln.text, { schema: true }) : { ok: true, ast: ln.text };
    if (parsed.ok) info.formula = parsed.ast;
    else info.errors.push(`This formula can't be read: ${parsed.error.message}`);
    const j = parseAxJustification(info.just, sys, theorems);
    if (j.error) { info.errors.push(j.error); info.ok = false; return; }
    info.rule = j.kind;
    info.refs = j.refs.map((m) => ({ from: m, to: m, single: true }));
    const cited = [];
    const nos = [];
    for (const m of j.refs) {
      if (m >= n) { info.errors.push(`Line ${n} cannot cite line ${m}: a line may cite only earlier lines.`); continue; }
      const c = out[m - 1];
      if (!c?.formula) { info.errors.push(`Line ${m} can't be cited.`); continue; }
      cited.push(c.formula);
      nos.push(m);
    }
    if (info.formula && !info.errors.length) {
      const v = validity([], info.formula);
      if (!v.valid) info.errors.push(`This formula is not a tautology (it is false when ${showRow(v.counterexamples[0])}), so no axiomatic proof can reach it.`);
      else info.errors.push(...checkLine(j, cited, info.formula, { sys, theorems, citedNos: nos, hintDf }));
    }
    info.ok = info.errors.length === 0;
  });
  for (const info of out) {
    if (!info.ok) continue;
    for (const r of info.refs) {
      const dep = out[r.from - 1];
      if (dep && (!dep.ok || dep.dependsOn)) { info.dependsOn = r.from; break; }
    }
  }
  const allOk = out.every((i) => i.ok);
  const reached = out.some((i) => i.formula && A.equal(i.formula, goal));
  const bad = out.filter((i) => !i.ok).map((i) => i.n);
  const problems = [];
  if (bad.length) problems.push(`Line${bad.length > 1 ? 's' : ''} ${bad.join(', ')} ${bad.length > 1 ? 'need' : 'needs'} attention.`);
  else if (!reached) problems.push(`Not finished: the theorem, ${print(goal)}, has not been reached.`);
  return { lines: out, complete: allOk && reached, problems };
}

function instantiateSafe(pat, s) {
  if (pat.type === 'meta') return s.get(pat.name) ?? null;
  const k = A.children(pat);
  if (!k.length) return pat;
  const kids = k.map((c) => instantiateSafe(c, s));
  return kids.includes(null) ? null : A.withChildren(pat, kids);
}

// --- independence by matrices --------------------------------------------------------
//
// A matrix gives tables for the primitive connectives over a few values, some
// of them designated. If every axiom but one always takes a designated value,
// modus ponens never leads from designated values to an undesignated one, and
// the remaining axiom sometimes takes an undesignated value, then that axiom
// cannot be derived from the others (Copi, Symbolic Logic §8.4).
// matrix: { values: [0, 1, 2], designated: [0], not: [..], or?: [[..]], and?: [[..]] }

function mEval(m, n, v, sys) {
  switch (n.type) {
    case 'meta': return v[n.name];
    case 'atom': return v[n.pred];
    case 'not': return m.not[mEval(m, n.arg, v, sys)];
    case 'or':
      if (m.or) return m.or[mEval(m, n.left, v, sys)][mEval(m, n.right, v, sys)];
      return m.not[m.and[m.not[mEval(m, n.left, v, sys)]][m.not[mEval(m, n.right, v, sys)]]];
    case 'and':
      if (m.and) return m.and[mEval(m, n.left, v, sys)][mEval(m, n.right, v, sys)];
      return m.not[m.or[m.not[mEval(m, n.left, v, sys)]][m.not[mEval(m, n.right, v, sys)]]];
    case 'imp':
      // ⊃ as the system defines it: ~p ∨ q in Principia, ~(p • ~q) in R.S.
      if (sys === 'RS') return m.not[m.and[mEval(m, n.left, v, sys)][m.not[mEval(m, n.right, v, sys)]]];
      return mEval(m, A.or(A.not(n.left), n.right), v, sys);
    default: throw new Error(`matrix: ${n.type}`);
  }
}

function lettersOf(n, out = new Set()) {
  if (n.type === 'meta') out.add(n.name);
  else if (n.type === 'atom' && !n.terms.length) out.add(n.pred);
  for (const c of A.children(n)) lettersOf(c, out);
  return [...out];
}

function* rows(letters, values) {
  const idx = letters.map(() => 0);
  while (true) {
    yield Object.fromEntries(letters.map((l, i) => [l, values[idx[i]]]));
    let k = letters.length - 1;
    while (k >= 0 && ++idx[k] === values.length) idx[k--] = 0;
    if (k < 0) return;
  }
}

/** Does the formula always take a designated value? Returns { always, row? }. */
export function alwaysDesignated(m, n, sys = 'PM') {
  const d = new Set(m.designated);
  for (const v of rows(lettersOf(n), m.values)) if (!d.has(mEval(m, n, v, sys))) return { always: false, row: v };
  return { always: true };
}

/** Does modus ponens preserve designation in the matrix? */
export function mpPreserves(m, sys = 'PM') {
  const d = new Set(m.designated);
  const imp = sys === 'RS' ? (a, b) => m.not[m.and[a][m.not[b]]] : (a, b) => (m.or ? m.or[m.not[a]][b] : m.not[m.and[a][m.not[b]]]);
  for (const a of m.values) for (const b of m.values) if (d.has(a) && d.has(imp(a, b)) && !d.has(b)) return false;
  return true;
}

/** For each axiom of a system: is it always designated in the matrix? And does MP preserve designation? */
export function matrixReport(m, systemId) {
  const sys = SYSTEMS[systemId];
  const axioms = Object.fromEntries(Object.entries(sys.axioms).map(([k, ax]) => [k, alwaysDesignated(m, ax.ast, systemId)]));
  return { axioms, mp: mpPreserves(m, systemId) };
}

/** The axioms a matrix shows independent: the only one not always designated, if MP is preserved. */
export function shownIndependent(m, systemId) {
  const r = matrixReport(m, systemId);
  if (!r.mp) return [];
  const failing = Object.keys(r.axioms).filter((k) => !r.axioms[k].always);
  return failing.length === 1 ? failing : [];
}
