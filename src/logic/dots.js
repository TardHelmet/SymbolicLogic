// Reading Principia's dot notation, as Langer (ch. VII §5) and Copi
// (Symbolic Logic §9.3) teach it, back into formulas.
//
// A formula in dots is a sequence of items: atoms, prefixes (~ □ ◇), quantifiers,
// parenthesized groups, binary connectives (∨ ⊃ ≡) with a group of dots on
// each side, and groups of dots standing alone, which are conjunctions. Each
// group has a count and a force (see printer.js): beside a connective, force I;
// after a quantifier, force II; a conjunction, force III. A group's scope runs,
// in its direction, past every weaker group and stops at the first group that
// is at least as strong (strength = 3·count + force). The main operator of a
// stretch is the one binary operator whose scope reaches both ends; if there
// is none, the stretch is a prefix, a quantifier, or a single item.
//
// Students type Copi's brackets; this reader is for content written in dots
// and for checking that the printer's dots say what the formula says.

import * as A from './ast.js';
import { tokenize, ParseError, BINOP_KINDS, KIND_TO_TYPE } from './notation.js';
import { parseFormula, checkFormula, checkArity } from './parser.js';
import { FORCE, rank, dotGlyph } from './printer.js';

const DOT_CHARS = new Set(['.', '·', '∙', '⋅', ':']);
const FORMULA_START = new Set(['NOT', 'OPEN', 'UPPER', 'LOWER', 'EX', 'ALL', 'BOX', 'DIA', 'DOT']);

// Tokens, with runs of adjacent dots and colons merged into one DOT group.
function dotTokens(text) {
  const out = [];
  for (const t of tokenize(text)) {
    if ((t.kind === 'AND' || t.kind === 'SEP') && DOT_CHARS.has(t.text)) {
      const count = t.text === ':' ? 2 : 1;
      const prev = out.at(-1);
      if (prev?.kind === 'DOT' && prev.end === t.pos) { prev.count += count; prev.end = t.end; continue; }
      out.push({ kind: 'DOT', count, pos: t.pos, end: t.end, text: t.text });
      continue;
    }
    if (t.kind === 'AND') throw new ParseError(`Principia writes “and” with a dot; “${t.text}” is not used here.`, t.pos, t.end);
    out.push(t);
  }
  return out;
}

const isVarTok = (t) => t?.kind === 'LOWER' && A.isVar(t.value);

// Is the token at i the start of a quantifier? Returns its length in tokens.
function quantifierAt(toks, i) {
  const t = toks[i];
  if ((t.kind === 'ALL' || t.kind === 'EX') && isVarTok(toks[i + 1])) return 2;
  if (t.kind !== 'OPEN' || t.text !== '(') return 0;
  if (isVarTok(toks[i + 1]) && toks[i + 2]?.kind === 'CLOSE') return 3;
  const e = toks[i + 1];
  const isE = e && (e.kind === 'EX' || e.kind === 'ALL' || (e.kind === 'UPPER' && e.value === 'E'));
  if (isE && isVarTok(toks[i + 2]) && toks[i + 3]?.kind === 'CLOSE') {
    if (e.kind !== 'UPPER') return 4;
    return FORMULA_START.has(toks[i + 4]?.kind) ? 4 : 0;
  }
  return 0;
}

// Split the tokens between lo and hi into items.
function items(text, toks, lo, hi, opts) {
  const out = [];
  let i = lo;
  const last = () => out.at(-1);
  while (i < hi) {
    const t = toks[i];
    if (t.kind === 'DOT') {
      const next = toks[i + 1];
      const group = { count: t.count, pos: t.pos, end: t.end };
      const prev = last();
      if (prev?.kind === 'bin' && !prev.rg) {
        prev.rg = { ...group, force: FORCE.conn };
        i++;
        continue;
      }
      if (i + 1 < hi && BINOP_KINDS.has(next.kind)) {
        i++;
        continue; // the left group of the connective that follows
      }
      if (prev?.kind === 'quant' && !prev.group) prev.group = { ...group, force: FORCE.quant };
      else if (prev?.kind === 'prefix') throw new ParseError('Principia brackets a negated compound, as in ~(p ∨ q); dots cannot follow ~.', t.pos, t.end);
      else if (!prev || i + 1 >= hi) throw new ParseError('A group of dots must stand between two formulas.', t.pos, t.end);
      else out.push({ kind: 'and', group: { ...group, force: FORCE.and }, pos: t.pos, end: t.end });
      i++;
      continue;
    }
    if (BINOP_KINDS.has(t.kind)) {
      const before = toks[i - 1];
      const lg = before?.kind === 'DOT' && i - 1 >= lo
        ? { count: before.count, force: FORCE.conn, pos: before.pos, end: before.end }
        : { count: 0, force: FORCE.conn };
      out.push({ kind: 'bin', type: KIND_TO_TYPE[t.kind], lg, rg: null, pos: t.pos, end: t.end });
      if (toks[i + 1]?.kind !== 'DOT' || i + 1 >= hi) last().rg = { count: 0, force: FORCE.conn };
      i++;
      continue;
    }
    if (t.kind === 'NOT' || t.kind === 'BOX' || t.kind === 'DIA') {
      if ((t.kind === 'BOX' || t.kind === 'DIA') && !opts.modal) throw new ParseError('□ and ◇ belong to modal logic, introduced with possible worlds.', t.pos, t.end);
      out.push({ kind: 'prefix', type: { NOT: 'not', BOX: 'box', DIA: 'dia' }[t.kind], pos: t.pos, end: t.end });
      i++;
      continue;
    }
    const q = quantifierAt(toks, i);
    if (q) {
      const vTok = toks[i + q - (q === 2 ? 1 : 2)];
      const type = q === 3 || toks[i].kind === 'ALL' || toks[i + 1]?.kind === 'ALL' ? 'all' : 'some';
      out.push({ kind: 'quant', type, v: vTok.value, group: null, pos: t.pos, end: toks[i + q - 1].end });
      i += q;
      continue;
    }
    if (t.kind === 'OPEN') {
      let depth = 0;
      let j = i;
      for (; j < hi; j++) {
        if (toks[j].kind === 'OPEN') depth++;
        if (toks[j].kind === 'CLOSE' && --depth === 0) break;
      }
      if (j >= hi) throw new ParseError('This bracket is never closed.', t.pos, t.end);
      out.push({ kind: 'paren', lo: i + 1, hi: j, pos: t.pos, end: toks[j].end });
      i = j + 1;
      continue;
    }
    if (t.kind === 'CLOSE') throw new ParseError('This closing bracket has no opening partner.', t.pos, t.end);
    // An atom: a predicate with its terms, a letter, or an identity.
    let j = i + 1;
    if (t.kind === 'UPPER') while (j < hi && toks[j].kind === 'LOWER') j++;
    else if (t.kind === 'LOWER' && (toks[j]?.kind === 'EQ' || toks[j]?.kind === 'NEQ') && toks[j + 1]?.kind === 'LOWER') j += 2;
    else if (t.kind !== 'LOWER') throw new ParseError(`Unexpected “${t.text}”.`, t.pos, t.end);
    const src = text.slice(t.pos, toks[j - 1].end);
    const r = parseFormula(src, { schema: opts.schema });
    if (!r.ok) throw new ParseError(r.error.message, t.pos + r.error.pos, t.pos + r.error.end);
    out.push({ kind: 'atom', ast: r.ast, pos: t.pos, end: toks[j - 1].end });
    i = j;
  }
  return out;
}

// The groups an item presents to a scan passing it, in scanning order.
function groupsOf(item, leftward) {
  if (item.kind === 'bin') return leftward ? [item.rg, item.lg] : [item.lg, item.rg];
  if (item.kind === 'and') return [item.group];
  if (item.kind === 'quant' && item.group) return [item.group];
  return [];
}

function reaches(its, k, from, to, strength) {
  const step = to < k ? -1 : 1;
  for (let x = k + step; step < 0 ? x >= to : x < to; x += step) {
    for (const g of groupsOf(its[x], step < 0)) if (rank(g) >= strength) return false;
  }
  return true;
}

function span(text, toks, its, i, j, opts) {
  if (i >= j) throw new ParseError('A formula is missing here.', its[i - 1]?.end ?? 0, its[i - 1]?.end ?? 0);
  const candidates = [];
  for (let k = i; k < j; k++) {
    const it = its[k];
    if (it.kind === 'bin') {
      if (k === i || k === j - 1) throw new ParseError('A connective needs a formula on each side.', it.pos, it.end);
      if (reaches(its, k, k, i, rank(it.lg)) && reaches(its, k, k, j, rank(it.rg))) candidates.push(k);
    } else if (it.kind === 'and') {
      if (reaches(its, k, k, i, rank(it.group)) && reaches(its, k, k, j, rank(it.group))) candidates.push(k);
    }
  }
  if (candidates.length === 1) {
    const k = candidates[0];
    const it = its[k];
    return A.binary(it.kind === 'and' ? 'and' : it.type, span(text, toks, its, i, k, opts), span(text, toks, its, k + 1, j, opts));
  }
  if (candidates.length > 1) {
    const it = its[candidates[1]];
    throw new ParseError('Two groups of dots of the same strength compete to be the main connective. Add a dot to the one that should govern.', it.pos, it.end);
  }
  const first = its[i];
  if (first.kind === 'prefix') {
    const arg = span(text, toks, its, i + 1, j, opts);
    return first.type === 'not' ? A.not(arg) : first.type === 'box' ? A.box(arg) : A.dia(arg);
  }
  if (first.kind === 'quant') {
    if (first.group && !reaches(its, i, i, j, rank(first.group))) {
      throw new ParseError('The dots after this quantifier do not reach the end of its formula; its scope needs more dots than any group inside it.', first.pos, first.end);
    }
    const body = span(text, toks, its, i + 1, j, opts);
    return first.type === 'all' ? A.all(first.v, body) : A.some(first.v, body);
  }
  if (j - i === 1) {
    if (first.kind === 'atom') return first.ast;
    if (first.kind === 'paren') return formulaIn(text, toks, first.lo, first.hi, opts);
  }
  const it = its[i + 1] ?? first;
  throw new ParseError('These dots leave the grouping undecided: no one connective governs the whole.', it.pos, it.end);
}

function formulaIn(text, toks, lo, hi, opts) {
  const its = items(text, toks, lo, hi, opts);
  return span(text, toks, its, 0, its.length, opts);
}

function wrap(fn) {
  try {
    return fn();
  } catch (e) {
    if (e instanceof ParseError) return { ok: false, error: { message: e.message, pos: e.pos, end: e.end } };
    throw e;
  }
}

/** Parse one formula written with dots as brackets. Options as parseFormula. */
export function parseDots(text, opts = {}) {
  return wrap(() => {
    const toks = dotTokens(text);
    const hi = toks.length - 1; // EOF
    if (hi <= 0) throw new ParseError('Nothing to read yet.', 0, 0);
    const sep = toks.findIndex((t) => t.kind === 'SEP' || t.kind === 'COMMA');
    if (sep >= 0) throw new ParseError('Only one formula here; in dots, “:” is punctuation.', toks[sep].pos, toks[sep].end);
    const ast = formulaIn(text, toks, 0, hi, opts);
    const problem = checkFormula(ast, opts);
    if (problem) return { ok: false, error: problem };
    return { ok: true, ast };
  });
}

/** Parse "P1, P2, … / C" with each formula in dots. Only “/” marks the conclusion. */
export function parseDotsArgument(text, opts = {}) {
  const slash = text.lastIndexOf('/');
  if (slash < 0) return { ok: false, error: { message: 'Mark the conclusion with “/”.', pos: 0, end: 0 } };
  const parts = text.slice(0, slash).split(',').map((s) => s.trim()).filter(Boolean);
  const premises = [];
  for (const p of parts) {
    const r = parseDots(p, opts);
    if (!r.ok) return r;
    premises.push(r.ast);
  }
  const c = parseDots(text.slice(slash + 1).replace(/^∴/, '').trim(), opts);
  if (!c.ok) return c;
  const arity = checkArity([...premises, c.ast]);
  if (arity) return { ok: false, error: arity };
  return { ok: true, premises, conclusion: c.ast };
}

export { dotGlyph };
