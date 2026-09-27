// Printing formulas. Hurley style: no outer brackets; binary subformulas are
// bracketed; bracket kind follows nesting height from the inside out,
// ( ) then [ ] then { }, as in (x)[Fx ⊃ (∃y)(Gy • Rxy)].

import { isBinary } from './ast.js';
import { GLYPH } from './notation.js';

const BRACKETS = { hurley: ['()', '[]', '{}'], modern: ['()'] };

function quantPrefix(n, notation) {
  if (notation === 'modern') return `${n.type === 'all' ? '∀' : '∃'}${n.v}`;
  return n.type === 'all' ? `(${n.v})` : `(∃${n.v})`;
}

function render(n, notation) {
  const g = GLYPH[notation];
  switch (n.type) {
    case 'atom':
      return { s: n.pred + n.terms.join(''), h: 0 };
    case 'eq':
      return { s: `${n.left} = ${n.right}`, h: 0 };
    case 'meta':
      return { s: n.name, h: 0 };
    case 'not':
    case 'box':
    case 'dia': {
      const r = operand(n.arg, notation);
      return { s: g[n.type] + r.s, h: r.h };
    }
    case 'all':
    case 'some': {
      const r = operand(n.body, notation);
      return { s: quantPrefix(n, notation) + r.s, h: r.h };
    }
    default: {
      const l = isBinary(n.left) ? wrap(render(n.left, notation), notation) : render(n.left, notation);
      const r = isBinary(n.right) ? wrap(render(n.right, notation), notation) : render(n.right, notation);
      return { s: `${l.s} ${g[n.type]} ${r.s}`, h: Math.max(l.h, r.h) };
    }
  }
}

// The operand of ~, a quantifier, □ or ◇ is bracketed when it is binary or
// an identity, so that ~(a = b) and (x)(x = a) read unambiguously.
function operand(n, notation) {
  const r = render(n, notation);
  return isBinary(n) || n.type === 'eq' ? wrap(r, notation) : r;
}

function wrap({ s, h }, notation) {
  const kinds = BRACKETS[notation];
  const b = kinds[h % kinds.length];
  return { s: b[0] + s + b[1], h: h + 1 };
}

export function print(n, opts = {}) {
  return render(n, opts.notation === 'modern' ? 'modern' : 'hurley').s;
}

export function printArgument(premises, conclusion, opts = {}) {
  const ps = premises.map((p) => print(p, opts)).join(', ');
  return ps ? `${ps} / ${print(conclusion, opts)}` : `/ ${print(conclusion, opts)}`;
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
