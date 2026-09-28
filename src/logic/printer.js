// Printing formulas.
//
// Copi (and Hurley): no outer brackets; binary subformulas are bracketed;
// bracket kind follows nesting height from the inside out, ( ) then [ ] then
// { }, as in (x)[Fx ⊃ (∃y)(Gy • Rxy)].
//
// Modern: the same structure with ¬ ∧ → ↔ ∀ and round brackets only.
//
// Principia (Langer, ch. VII §5; Copi, Symbolic Logic §9.3): dots instead of
// brackets. A group of dots has a count and a force: I beside ∨ ⊃ ≡, II after
// a quantifier, III for "and". A group's scope runs past any weaker group and
// stops at the first group, on its side, that is at least as strong; strength
// is 3·count + force, with III = 0, II = 1, I = 2. So `p . q . ⊃ . r` is
// (p • q) ⊃ r, as in Principia. Negated compounds keep their parentheses,
// ~(p ∨ q), and a quantifier gets more dots than anything in its scope.

import { isBinary } from './ast.js';
import { GLYPH, normalizeNotation } from './notation.js';

const BRACKETS = { copi: ['()', '[]', '{}'], modern: ['()'], principia: ['()'] };

// x1 prints as x₁.
const SUB = '₀₁₂₃₄₅₆₇₈₉';
export const term = (t) => t.replace(/\d/g, (d) => SUB[d]);

function quantPrefix(n, notation) {
  if (notation === 'modern') return `${n.type === 'all' ? '∀' : '∃'}${term(n.v)}`;
  return n.type === 'all' ? `(${term(n.v)})` : `(∃${term(n.v)})`;
}

export function print(n, opts = {}) {
  return printTokens(n, opts).map((t) => t.s).join('');
}

export function printArgument(premises, conclusion, opts = {}) {
  const ps = premises.map((p) => print(p, opts)).join(', ');
  return ps ? `${ps} /∴ ${print(conclusion, opts)}` : `/∴ ${print(conclusion, opts)}`;
}

// Words for screen readers; symbols like ⊃ are otherwise read as "superset".
export function speak(n) {
  switch (n.type) {
    case 'atom':
      return n.terms.length ? `${n.pred} ${n.terms.join(' ')}` : n.pred;
    case 'eq':
      return `${n.left} equals ${n.right}`;
    case 'meta':
      return n.name;
    case 'not':
      return `not ${speak(n.arg)}`;
    case 'box':
      return `necessarily ${speak(n.arg)}`;
    case 'dia':
      return `possibly ${speak(n.arg)}`;
    case 'all':
      return `for every ${n.v}, ${speak(n.body)}`;
    case 'some':
      return `there is an ${n.v} such that ${speak(n.body)}`;
    case 'and':
      return `both ${speak(n.left)} and ${speak(n.right)}`;
    case 'or':
      return `either ${speak(n.left)} or ${speak(n.right)}`;
    case 'imp':
      return `if ${speak(n.left)} then ${speak(n.right)}`;
    case 'iff':
      return `${speak(n.left)} if and only if ${speak(n.right)}`;
    default:
      return '';
  }
}

/** The main operator's printed glyph and name, for "main operator" exercises. */
export function mainOperator(n) {
  const names = {
    not: 'tilde (negation)', and: 'dot (conjunction)', or: 'wedge (disjunction)',
    imp: 'horseshoe (conditional)', iff: 'triple bar (biconditional)',
    all: 'universal quantifier', some: 'existential quantifier',
    box: 'box (necessity)', dia: 'diamond (possibility)',
  };
  if (n.type === 'atom' || n.type === 'eq') return { type: 'none', name: 'none: the formula is atomic' };
  return { type: n.type, name: names[n.type] };
}

/**
 * The printed formula as tokens: { s, op?: true, path?, meta?: true }.
 * Operator tokens carry the path of the node they belong to, so a UI can
 * let students click an operator and learn its scope.
 */
export function printTokens(n, opts = {}) {
  const notation = normalizeNotation(opts.notation);
  return notation === 'principia' ? dotTokens(n, []).toks : bracketTokens(n, notation);
}

function bracketTokens(n, notation) {
  const g = GLYPH[notation];
  const kinds = BRACKETS[notation];
  const wrapT = ({ toks, h }) => {
    const b = kinds[h % kinds.length];
    return { toks: [{ s: b[0] }, ...toks, { s: b[1] }], h: h + 1 };
  };
  const rt = (m, path) => {
    switch (m.type) {
      case 'atom':
        return { toks: [{ s: m.pred + m.terms.map(term).join('') }], h: 0 };
      case 'eq':
        return { toks: [{ s: `${term(m.left)} = ${term(m.right)}` }], h: 0 };
      case 'meta':
        return { toks: [{ s: m.name, meta: true }], h: 0 };
      case 'not':
      case 'box':
      case 'dia': {
        const r = operandT(m.arg, [...path, 0]);
        return { toks: [{ s: g[m.type], op: true, path }, ...r.toks], h: r.h };
      }
      case 'all':
      case 'some': {
        const r = operandT(m.body, [...path, 0]);
        return { toks: [{ s: quantPrefix(m, notation), op: true, path }, ...r.toks], h: r.h };
      }
      default: {
        const l = isBinary(m.left) ? wrapT(rt(m.left, [...path, 0])) : rt(m.left, [...path, 0]);
        const r = isBinary(m.right) ? wrapT(rt(m.right, [...path, 1])) : rt(m.right, [...path, 1]);
        return { toks: [...l.toks, { s: ` ${g[m.type]} `, op: true, path }, ...r.toks], h: Math.max(l.h, r.h) };
      }
    }
  };
  // The operand of ~, a quantifier, □ or ◇ is bracketed when it is binary or
  // an identity, so that ~(a = b) and (x)(x = a) read unambiguously.
  const operandT = (m, path) => {
    const r = rt(m, path);
    return isBinary(m) || m.type === 'eq' ? wrapT(r) : r;
  };
  return rt(n, []).toks;
}

// --- Principia dots -----------------------------------------------------------

export const FORCE = { and: 0, quant: 1, conn: 2 };
export const rank = (g) => 3 * g.count + g.force;
export const dotGlyph = (count) => ':'.repeat(count >> 1) + (count & 1 ? '.' : '');
const higher = (a, b) => (!a ? b : !b ? a : rank(a) >= rank(b) ? a : b);

// Returns { toks, top }, where top is the strongest group of dots outside any
// parentheses (null if none), which decides how many dots the parent needs.
function dotTokens(m, path) {
  const g = GLYPH.principia;
  switch (m.type) {
    case 'atom':
      return { toks: [{ s: m.pred + m.terms.map(term).join('') }], top: null };
    case 'eq':
      return { toks: [{ s: `${term(m.left)} = ${term(m.right)}` }], top: null };
    case 'meta':
      return { toks: [{ s: m.name, meta: true }], top: null };
    case 'not':
    case 'box':
    case 'dia': {
      const r = dotTokens(m.arg, [...path, 0]);
      if (isBinary(m.arg) || m.arg.type === 'eq') {
        return { toks: [{ s: g[m.type], op: true, path }, { s: '(' }, ...r.toks, { s: ')' }], top: null };
      }
      return { toks: [{ s: g[m.type], op: true, path }, ...r.toks], top: r.top };
    }
    case 'all':
    case 'some': {
      const r = dotTokens(m.body, [...path, 0]);
      if (m.body.type === 'eq') {
        return { toks: [{ s: quantPrefix(m, 'copi'), op: true, path }, { s: '(' }, ...r.toks, { s: ')' }], top: null };
      }
      if (!isBinary(m.body)) return { toks: [{ s: quantPrefix(m, 'copi'), op: true, path }, ...r.toks], top: r.top };
      const count = (r.top?.count ?? 0) + 1;
      return {
        toks: [{ s: `${quantPrefix(m, 'copi')} ${dotGlyph(count)} `, op: true, path }, ...r.toks],
        top: { count, force: FORCE.quant },
      };
    }
    default: {
      const l = dotTokens(m.left, [...path, 0]);
      const r = dotTokens(m.right, [...path, 1]);
      const top = higher(l.top, r.top);
      if (m.type === 'and') {
        const count = top ? top.count + 1 : 1;
        return { toks: [...l.toks, { s: ` ${dotGlyph(count)} `, op: true, path }, ...r.toks], top: { count, force: FORCE.and } };
      }
      const count = !top ? 0 : top.force === FORCE.and ? top.count : top.count + 1;
      const d = count ? ` ${dotGlyph(count)} ` : ' ';
      return {
        toks: [...l.toks, { s: `${d}${g[m.type]}${d}`, op: true, path }, ...r.toks],
        top: { count, force: FORCE.conn },
      };
    }
  }
}
