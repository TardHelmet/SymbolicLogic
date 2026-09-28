// The algebra of logic in Langer's notation (An Introduction to Symbolic Logic,
// chs. V–IX): classes a, b, c …, their sum a + b, product a × b (or ab),
// complement −a, the null class 0 and the universe class 1.
//
// Terms are stored as formula trees (+ as ∨, × as •, − as ~, with 0 and 1 as
// reserved atoms), so that the replacement engine in rules.js can check a
// step that applies a postulate anywhere inside a term. They are never handed
// to the truth-table code, which would treat 0 and 1 as letters: evalTerm
// below is the algebra's own evaluator.
//
// An equation holds in every Boolean algebra exactly when it holds in the
// two-element algebra {0, 1} (the algebra of truth values, Langer ch. X), so
// holdsInTwo decides whether a step is even true.

import * as A from './ast.js';
import { ParseError } from './notation.js';
import { match } from './match.js';
import { rewriteCost } from './rules.js';

export const ZERO = A.atom('0');
export const ONE = A.atom('1');
const isConstAtom = (n) => n.type === 'atom' && (n.pred === '0' || n.pred === '1');

// --- reading terms ---------------------------------------------------------------

const TIMES = new Set(['×', '*', '·', '∙', '⋅']);
const MINUS = new Set(['−', '-', '~', '¬', '–']);

function lex(text) {
  const toks = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (/\s/.test(ch)) continue;
    let kind;
    if (/[a-z]/.test(ch)) kind = 'VAR';
    else if (ch === '0' || ch === '1') kind = 'CONST';
    else if (ch === '+') kind = 'PLUS';
    else if (TIMES.has(ch)) kind = 'TIMES';
    else if (MINUS.has(ch)) kind = 'MINUS';
    else if ('([{'.includes(ch)) kind = 'OPEN';
    else if (')]}'.includes(ch)) kind = 'CLOSE';
    else if (ch === '=') kind = 'EQ';
    else if (ch === '≠') kind = 'NEQ';
    else throw new ParseError(`“${ch}” is not used in the algebra of classes. Use + × − 0 1 and brackets.`, i, i + 1);
    toks.push({ kind, text: ch, pos: i, end: i + 1 });
  }
  toks.push({ kind: 'EOF', text: '', pos: text.length, end: text.length });
  return toks;
}

class TermParser {
  constructor(text) { this.toks = lex(text); this.i = 0; }
  peek() { return this.toks[this.i]; }
  next() { return this.toks[this.i++]; }
  fail(msg, t = this.peek()) { throw new ParseError(msg, t.pos, t.end); }

  // sum ::= product ['+' product]
  sum() {
    const left = this.product();
    if (this.peek().kind !== 'PLUS') return left;
    this.next();
    const right = this.product();
    if (this.peek().kind === 'PLUS') this.fail('Two sums side by side: bracket one of them. That a + (b + c) = (a + b) + c is a theorem (11a), not a convention.');
    return A.or(left, right);
  }

  // product ::= factor [('×' | juxtaposition) factor]
  product() {
    const left = this.factor();
    const t = this.peek();
    const juxt = ['VAR', 'CONST', 'OPEN', 'MINUS'].includes(t.kind);
    if (t.kind !== 'TIMES' && !juxt) return left;
    if (t.kind === 'TIMES') this.next();
    const right = this.factor();
    const u = this.peek();
    if (u.kind === 'TIMES' || ['VAR', 'CONST', 'OPEN', 'MINUS'].includes(u.kind)) {
      this.fail('Two products side by side: bracket one of them. That a × (b × c) = (a × b) × c is a theorem (11b), not a convention.');
    }
    return A.and(left, right);
  }

  factor() {
    const t = this.next();
    if (t.kind === 'MINUS') return A.not(this.factor());
    if (t.kind === 'VAR') return A.atom(t.text);
    if (t.kind === 'CONST') return t.text === '0' ? ZERO : ONE;
    if (t.kind === 'OPEN') {
      const inner = this.sum();
      if (this.peek().kind !== 'CLOSE') this.fail('This bracket is never closed.', t);
      this.next();
      return inner;
    }
    if (t.kind === 'EOF') this.fail('A term is missing here.', t);
    return this.fail(`Unexpected “${t.text}”.`, t);
  }
}

function wrap(fn) {
  try {
    return fn();
  } catch (e) {
    if (e instanceof ParseError) return { ok: false, error: { message: e.message, pos: e.pos, end: e.end } };
    throw e;
  }
}

/** Read a term such as “a × (b + −c)”. */
export function parseTerm(text) {
  return wrap(() => {
    const p = new TermParser(text);
    if (p.peek().kind === 'EOF') p.fail('Nothing to read yet.');
    const t = p.sum();
    if (p.peek().kind !== 'EOF') p.fail(`Unexpected “${p.peek().text}” after a complete term.`);
    return { ok: true, term: t };
  });
}

/** Read an equation “s = t” (or “s ≠ t”). */
export function parseEquation(text) {
  return wrap(() => {
    const p = new TermParser(text);
    if (p.peek().kind === 'EOF') p.fail('Nothing to read yet.');
    const left = p.sum();
    const op = p.peek();
    if (op.kind !== 'EQ' && op.kind !== 'NEQ') p.fail('An equation needs “=” between two terms.');
    p.next();
    const right = p.sum();
    if (p.peek().kind !== 'EOF') p.fail(`Unexpected “${p.peek().text}” after a complete equation.`);
    return { ok: true, eq: { left, right, neq: op.kind === 'NEQ' } };
  });
}

// --- printing ----------------------------------------------------------------------

export function printTerm(t) {
  switch (t.type) {
    case 'atom': return t.pred;
    case 'not': return `−${t.arg.type === 'atom' ? printTerm(t.arg) : `(${printTerm(t.arg)})`}`;
    case 'or':
    case 'and': {
      const side = (s) => (s.type === 'or' || s.type === 'and' ? `(${printTerm(s)})` : printTerm(s));
      return `${side(t.left)} ${t.type === 'or' ? '+' : '×'} ${side(t.right)}`;
    }
    case 'meta': return t.name;
    default: return '?';
  }
}

export const printEquation = (e) => `${printTerm(e.left)} ${e.neq ? '≠' : '='} ${printTerm(e.right)}`;
export const equalEq = (a, b) => A.equal(a.left, b.left) && A.equal(a.right, b.right) && !!a.neq === !!b.neq;

// --- evaluation --------------------------------------------------------------------

/** Class letters in terms, alphabetised. */
export function lettersOf(...terms) {
  const out = new Set();
  const walk = (t) => {
    if (t.type === 'atom' && !isConstAtom(t)) out.add(t.pred);
    for (const c of A.children(t)) walk(c);
  };
  terms.forEach(walk);
  return [...out].sort();
}

// The two-element algebra: classes are 0 or 1.
export const TWO = {
  elements: [0, 1], zero: 0, one: 1,
  plus: (x, y) => x | y, times: (x, y) => x & y, comp: (x) => 1 - x,
};

/** The value of a term in an algebra (default: the two-element one) under an assignment. */
export function evalTerm(t, env, alg = TWO) {
  switch (t.type) {
    case 'atom':
      if (t.pred === '0') return alg.zero;
      if (t.pred === '1') return alg.one;
      return env[t.pred];
    case 'not': return alg.comp(evalTerm(t.arg, env, alg));
    case 'or': return alg.plus(evalTerm(t.left, env, alg), evalTerm(t.right, env, alg));
    case 'and': return alg.times(evalTerm(t.left, env, alg), evalTerm(t.right, env, alg));
    default: throw new Error(`not a term: ${t.type}`);
  }
}

function* assignments(letters, elements) {
  const idx = letters.map(() => 0);
  if (!letters.length) { yield {}; return; }
  while (true) {
    yield Object.fromEntries(letters.map((l, i) => [l, elements[idx[i]]]));
    let k = letters.length - 1;
    while (k >= 0 && ++idx[k] === elements.length) idx[k--] = 0;
    if (k < 0) return;
  }
}

/**
 * Does the equation hold for every assignment in the algebra? Returns
 * { holds: true } or { holds: false, env, values: [left, right] }.
 */
export function holdsIn(alg, e) {
  for (const env of assignments(lettersOf(e.left, e.right), alg.elements)) {
    const l = evalTerm(e.left, env, alg);
    const r = evalTerm(e.right, env, alg);
    if ((l === r) === !!e.neq) return { holds: false, env, values: [l, r] };
  }
  return { holds: true };
}

export const holdsInTwo = (e) => holdsIn(TWO, e);

// --- laws ----------------------------------------------------------------------------

// Class letters in a law are variables: a, b, c become metavariables.
function schematize(t) {
  if (t.type === 'atom' && !isConstAtom(t)) return A.meta(t.pred);
  const kids = A.children(t);
  return kids.length ? A.withChildren(t, kids.map(schematize)) : t;
}

const law = (statements) => statements.map((s) => {
  const e = parseEquation(s).eq;
  return [schematize(e.left), schematize(e.right)];
});

/**
 * Huntington's first set of postulates (1904), as Langer states them (ch. IX,
 * p. 208), and the theorems she derives from them. The existential and
 * closure postulates (Ia, Ib, IIa's and IIb's “there is”, VI) are not rewrite
 * laws and are not listed.
 */
export const LAWS = {
  IIa: { name: 'Postulate IIa', statements: ['a + 0 = a'] },
  IIb: { name: 'Postulate IIb', statements: ['a × 1 = a'] },
  IIIa: { name: 'Postulate IIIa (commutative law for +)', statements: ['a + b = b + a'] },
  IIIb: { name: 'Postulate IIIb (commutative law for ×)', statements: ['a × b = b × a'] },
  IVa: { name: 'Postulate IVa (distributive law)', statements: ['a + (b × c) = (a + b) × (a + c)'] },
  IVb: { name: 'Postulate IVb (distributive law)', statements: ['a × (b + c) = (a × b) + (a × c)'] },
  V: { name: 'Postulate V (complements)', statements: ['a + −a = 1', 'a × −a = 0'] },
  '2a': { name: 'Theorem 2a (tautology)', statements: ['a + a = a'] },
  '2b': { name: 'Theorem 2b (tautology)', statements: ['a × a = a'] },
  '3a': { name: 'Theorem 3a', statements: ['a + 1 = 1'] },
  '3b': { name: 'Theorem 3b', statements: ['a × 0 = 0'] },
  '4a': { name: 'Theorem 4a (absorption)', statements: ['a + (a × b) = a'] },
  '4b': { name: 'Theorem 4b (absorption)', statements: ['a × (a + b) = a'] },
  '5a': { name: 'Theorem 5a (expansion)', statements: ['(a + b) × (a + −b) = a'] },
  '5b': { name: 'Theorem 5b (expansion)', statements: ['(a × b) + (a × −b) = a'] },
  8: { name: 'Theorem 8 (double negation)', statements: ['a = −(−a)'] },
  '10a': { name: 'Theorem 10a (De Morgan)', statements: ['−(a + b) = −a × −b'] },
  '10b': { name: 'Theorem 10b (De Morgan)', statements: ['−(a × b) = −a + −b'] },
  '11a': { name: 'Theorem 11a (associative law)', statements: ['(a + b) + c = a + (b + c)'] },
  '11b': { name: 'Theorem 11b (associative law)', statements: ['(a × b) × c = a × (b × c)'] },
};
for (const l of Object.values(LAWS)) l.formPats = law(l.statements);

export const POSTULATES = ['IIa', 'IIb', 'IIIa', 'IIIb', 'IVa', 'IVb', 'V'];

/** The dual of a term or equation: + and × exchanged, 0 and 1 exchanged. */
export function dual(t) {
  if (t.left !== undefined && t.right !== undefined && !t.type) return { ...t, left: dual(t.left), right: dual(t.right) };
  switch (t.type) {
    case 'atom': return t.pred === '0' ? ONE : t.pred === '1' ? ZERO : t;
    case 'or': return A.and(dual(t.left), dual(t.right));
    case 'and': return A.or(dual(t.left), dual(t.right));
    case 'not': return A.not(dual(t.arg));
    default: return t;
  }
}

// --- derivations ------------------------------------------------------------------------
//
// A derivation is a list of equations, each justified by one of:
//   IIb            one application of a law (a postulate or earlier theorem)
//                  turns one side into the other: a × 1 = a, or a = a × 1
//   3, V           line 3 with one side rewritten by one application of V
//   Sym 3          line 3 turned around
//   Trans 3, 5     s = t and t = u give s = u
//   Compl 3, 4     a + x = 1 and a × x = 0 give x = −a (Theorem 6: the
//                  complement is unique)
// The derivation is complete when a line is the goal (either way round).

const STRUCT = { sym: 'Sym', trans: 'Trans', compl: 'Compl', refl: 'Refl' };

export function parseAlgebraJustification(text, laws) {
  let src = (text ?? '').trim();
  if (!src) return { error: 'Give a justification: a postulate or theorem, as in “IIb”, or a line and a law, as in “3, V”.' };
  const names = [];
  // “Th. 8”, “Theorem 4b”: a theorem, not line 8.
  src = src.replace(/\b(?:th|thm|theorem)\.?\s*(\d+[ab]?)\b/gi, (_, id) => { names.push(id); return ' '; });
  const refs = [];
  for (const m of src.matchAll(/\b(\d+[ab]|[A-Za-z]+|\d+)\b/g)) {
    if (/^\d+$/.test(m[1])) refs.push(+m[1]);
    else if (!/^(postulate|post|by|and|lines?)$/i.test(m[1])) names.push(m[1]);
  }
  if (!names.length) return { error: 'Name the postulate or theorem, as in “IIb” or “Th. 4b”.' };
  if (names.length > 1) return { error: `Cite one law per line: ${names.join(', ')}.` };
  const w = names[0];
  const s = STRUCT[w.toLowerCase()];
  if (s) return { rule: s, refs };
  const id = Object.keys(LAWS).find((k) => k.toLowerCase() === w.toLowerCase());
  if (!id) return { error: `“${w}” is not a postulate or theorem here. Available: ${laws.join(', ')}.` };
  if (!laws.includes(id)) return { error: `${LAWS[id].name} is not available in this exercise. Available: ${laws.join(', ')}.` };
  return { rule: id, refs };
}

function oneLaw(id, s, t, maxApps) {
  const c = rewriteCost(LAWS[id].formPats, s, t);
  return c >= 1 && c <= maxApps;
}

function whichLaws(laws, s, t, maxApps) {
  return laws.filter((id) => oneLaw(id, s, t, maxApps));
}

function falsify(e) {
  const h = holdsInTwo(e);
  if (h.holds) return null;
  const vals = Object.entries(h.env).map(([k, v]) => `${k} = ${v}`).join(', ');
  return `This equation is false in the algebra of two classes 0 and 1: with ${vals}, the left side is ${h.values[0]} and the right side is ${h.values[1]}. No law of the algebra can give it.`;
}

function checkLine(j, cited, target, ctx) {
  const { laws, maxApps } = ctx;
  if (target.neq) return ['Derivations here prove equations; ≠ is not derived by these rules.'];
  if (LAWS[j.rule]) {
    if (!cited.length) {
      if (A.equal(target.left, target.right)) return ['Both sides are the same; the law changes nothing.'];
      if (oneLaw(j.rule, target.left, target.right, maxApps)) return [];
      const others = whichLaws(laws, target.left, target.right, maxApps).filter((x) => x !== j.rule);
      if (others.length) return [`One side does turn into the other in one step, but by ${others.join(' or ')}, not ${j.rule}.`];
      return [falsify(target) ?? `This is not one application of ${j.rule} (${LAWS[j.rule].statements.join('; ')}) to either side.`];
    }
    if (cited.length !== 1) return [`Rewriting cites one line, as in “3, ${j.rule}”.`];
    const [E] = cited;
    const sides = [];
    if (A.equal(target.left, E.left)) sides.push([E.right, target.right]);
    if (A.equal(target.right, E.right)) sides.push([E.left, target.left]);
    if (!sides.length) return [`Keep one side of line ${ctx.citedNos[0]} as it is and rewrite the other: the new line must share its left side or its right side.`];
    for (const [s, t] of sides) {
      if (A.equal(s, t)) return ['This line is the same as the cited line.'];
      if (oneLaw(j.rule, s, t, maxApps)) return [];
    }
    for (const [s, t] of sides) {
      const others = whichLaws(laws, s, t, maxApps).filter((x) => x !== j.rule);
      if (others.length) return [`The rewrite is right, but it is ${others.join(' or ')}, not ${j.rule}.`];
      const cost = rewriteCost(LAWS[j.rule].formPats, s, t);
      if (cost < Infinity) return [`That takes ${cost} applications of ${j.rule}; apply it once per line.`];
    }
    return [falsify(target) ?? `This is not one application of ${j.rule} (${LAWS[j.rule].statements.join('; ')}) to line ${ctx.citedNos[0]}.`];
  }
  if (j.rule === 'Refl') return A.equal(target.left, target.right) ? [] : ['Refl gives only equations of the form t = t.'];
  if (j.rule === 'Sym') {
    if (cited.length !== 1) return ['Sym cites one line.'];
    return A.equal(target.left, cited[0].right) && A.equal(target.right, cited[0].left) ? [] : ['Sym turns an equation around: from s = t, t = s.'];
  }
  if (j.rule === 'Trans') {
    if (cited.length !== 2) return ['Trans cites two lines.'];
    for (const [E, F] of [[cited[0], cited[1]], [cited[1], cited[0]]]) {
      if (A.equal(E.right, F.left) && A.equal(target.left, E.left) && A.equal(target.right, F.right)) return [];
    }
    return ['Trans joins s = t and t = u into s = u: the middle terms must match.'];
  }
  if (j.rule === 'Compl') {
    if (cited.length !== 2) return ['Compl cites two lines: a + x = 1 and a × x = 0.'];
    for (const [S, P] of [[cited[0], cited[1]], [cited[1], cited[0]]]) {
      if (S.left.type !== 'or' || !A.equal(S.right, ONE) || P.left.type !== 'and' || !A.equal(P.right, ZERO)) continue;
      const a = S.left.left;
      const x = S.left.right;
      if (!A.equal(P.left.left, a) || !A.equal(P.left.right, x)) continue;
      const want = [x, A.not(a)];
      if ((A.equal(target.left, want[0]) && A.equal(target.right, want[1])) || (A.equal(target.left, want[1]) && A.equal(target.right, want[0]))) return [];
      return [`From these lines Compl gives ${printTerm(x)} = ${printTerm(A.not(a))}.`];
    }
    return ['Compl needs a line of the form a + x = 1 and one of the form a × x = 0, with the same a and x in the same places. Then x = −a, since a has only one complement (Theorem 6).'];
  }
  return [`${j.rule} cannot be used here.`];
}

/**
 * Check a derivation. goal: an equation; lines: [{ text, just }].
 * options.laws: ids of the laws available; options.maxApps (default 1).
 */
export function checkDerivation({ goal, lines }, options = {}) {
  const laws = options.laws ?? POSTULATES;
  const maxApps = options.maxApps ?? 1;
  const out = [];
  lines.forEach((ln, k) => {
    const n = k + 1;
    const info = { n, text: ln.text, just: ln.just ?? '', refs: [], errors: [], depth: 0, path: [] };
    out.push(info);
    const parsed = typeof ln.text === 'string' ? parseEquation(ln.text) : { ok: true, eq: ln.text };
    if (parsed.ok) info.eq = parsed.eq;
    else info.errors.push(`This equation can't be read: ${parsed.error.message}`);
    const j = parseAlgebraJustification(info.just, laws);
    if (j.error) { info.errors.push(j.error); info.ok = false; return; }
    info.rule = j.rule;
    info.refs = j.refs.map((m) => ({ from: m, to: m, single: true }));
    const cited = [];
    const nos = [];
    for (const m of j.refs) {
      if (m >= n) { info.errors.push(`Line ${n} cannot cite line ${m}: a line may cite only earlier lines.`); continue; }
      const c = out[m - 1];
      if (!c?.eq) { info.errors.push(`Line ${m} can't be cited.`); continue; }
      cited.push(c.eq);
      nos.push(m);
    }
    if (info.eq && !info.errors.length) info.errors.push(...checkLine(j, cited, info.eq, { laws, maxApps, citedNos: nos }));
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
  const flipped = { left: goal.right, right: goal.left };
  const reached = out.some((i) => i.eq && (equalEq(i.eq, goal) || equalEq(i.eq, flipped)));
  const bad = out.filter((i) => !i.ok).map((i) => i.n);
  const problems = [];
  if (bad.length) problems.push(`Line${bad.length > 1 ? 's' : ''} ${bad.join(', ')} ${bad.length > 1 ? 'need' : 'needs'} attention.`);
  else if (!reached) problems.push(`Not finished: the goal, ${printEquation(goal)}, has not been reached.`);
  return { lines: out, complete: allOk && reached, problems };
}

// --- finite algebras ------------------------------------------------------------------
//
// A finite structure given by tables, for testing which postulates it
// satisfies (Langer ch. X: a postulate set is satisfied by some systems and
// not others). spec: { elements: ['0', '½', '1'], zero: '0', one: '1',
//   plus: [[...], ...], times: [[...], ...], comp: [...] }, where the tables are
// indexed by the order of elements.

export function algebraFrom(spec) {
  const ix = (x) => spec.elements.indexOf(x);
  return {
    elements: spec.elements,
    zero: spec.zero,
    one: spec.one,
    plus: (x, y) => spec.plus[ix(x)][ix(y)],
    times: (x, y) => spec.times[ix(x)][ix(y)],
    comp: (x) => spec.comp[ix(x)],
  };
}

/** Which of Huntington's postulates a finite algebra satisfies, with a counterexample for each failure. */
export function checkPostulates(alg) {
  const out = {};
  for (const id of POSTULATES) {
    out[id] = { holds: true };
    for (const st of LAWS[id].statements) {
      const h = holdsIn(alg, parseEquation(st).eq);
      if (!h.holds) { out[id] = { holds: false, statement: st, env: h.env, values: h.values }; break; }
    }
  }
  out.VI = alg.elements.length >= 2 ? { holds: true } : { holds: false, statement: 'there are at least two classes' };
  return out;
}

// --- class equations as statements about individuals ---------------------------------------
//
// Langer reads “All S is P” as S < P, that is, S × −P = 0: nothing is S
// without being P. A class equation says something about the individuals in
// the universe of discourse, and translating it into predicate logic lets the
// finite-model engine decide which equations follow from which (monadic
// logic is decidable).

function simplifyConsts(t) {
  const k = A.children(t).map(simplifyConsts);
  const n = k.length ? A.withChildren(t, k) : t;
  const is0 = (x) => A.equal(x, ZERO);
  const is1 = (x) => A.equal(x, ONE);
  if (n.type === 'not') return is0(n.arg) ? ONE : is1(n.arg) ? ZERO : n;
  if (n.type === 'or') return is1(n.left) || is1(n.right) ? ONE : is0(n.left) ? n.right : is0(n.right) ? n.left : n;
  if (n.type === 'and') return is0(n.left) || is0(n.right) ? ZERO : is1(n.left) ? n.right : is1(n.right) ? n.left : n;
  return n;
}

function memberOf(t, v) {
  switch (t.type) {
    case 'atom': return A.atom(t.pred.toUpperCase(), [v]);
    case 'not': return A.not(memberOf(t.arg, v));
    case 'or': return A.or(memberOf(t.left, v), memberOf(t.right, v));
    case 'and': return A.and(memberOf(t.left, v), memberOf(t.right, v));
    default: throw new Error('not a term');
  }
}

/** The statement about individuals that a class equation makes. */
export function classFormula(e) {
  let l = simplifyConsts(e.left);
  let r = simplifyConsts(e.right);
  if (isConstAtom(l) && !isConstAtom(r)) [l, r] = [r, l];
  if (isConstAtom(l) && isConstAtom(r)) {
    const same = A.equal(l, r) !== !!e.neq;
    const T = A.or(A.atom('A'), A.not(A.atom('A')));
    return same ? T : A.not(T);
  }
  const x = 'x';
  let body;
  if (A.equal(r, ZERO)) body = memberOf(l, x);
  else if (A.equal(r, ONE)) body = A.not(memberOf(l, x));
  else body = A.not(A.iff(memberOf(l, x), memberOf(r, x)));
  // t = 0: nothing is in t.  t ≠ 0: something is.
  return e.neq ? A.some(x, body) : A.not(A.some(x, body));
}
