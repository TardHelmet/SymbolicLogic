// A canonical form for a fast equivalence check: bound variables renamed in
// order of binding, ⊃ and ≡ eliminated, negations pushed inward, and • and ∨
// flattened, sorted and deduplicated. Equal canonical forms are logically
// equivalent; unequal ones may still be equivalent (the model search decides).

import * as A from './ast.js';

function rename(n, env = new Map(), counter = { i: 0 }) {
  switch (n.type) {
    case 'atom':
      return A.atom(n.pred, n.terms.map((t) => env.get(t) ?? t));
    case 'eq':
      return A.eq(env.get(n.left) ?? n.left, env.get(n.right) ?? n.right);
    case 'all':
    case 'some': {
      const fresh = `_${counter.i++}`;
      const inner = new Map(env);
      inner.set(n.v, fresh);
      return A.quant(n.type, fresh, rename(n.body, inner, counter));
    }
    default:
      return A.withChildren(n, A.children(n).map((c) => rename(c, env, counter)));
  }
}

function nnf(n, neg = false) {
  switch (n.type) {
    case 'atom':
    case 'eq':
    case 'meta':
      return neg ? A.not(n) : n;
    case 'not':
      return nnf(n.arg, !neg);
    case 'and':
      return neg ? A.or(nnf(n.left, true), nnf(n.right, true)) : A.and(nnf(n.left), nnf(n.right));
    case 'or':
      return neg ? A.and(nnf(n.left, true), nnf(n.right, true)) : A.or(nnf(n.left), nnf(n.right));
    case 'imp':
      return nnf(A.or(A.not(n.left), n.right), neg);
    case 'iff':
      return nnf(A.or(A.and(n.left, n.right), A.and(A.not(n.left), A.not(n.right))), neg);
    case 'all':
      return neg ? A.some(n.v, nnf(n.body, true)) : A.all(n.v, nnf(n.body));
    case 'some':
      return neg ? A.all(n.v, nnf(n.body, true)) : A.some(n.v, nnf(n.body));
    case 'box':
      return neg ? A.dia(nnf(n.arg, true)) : A.box(nnf(n.arg));
    case 'dia':
      return neg ? A.box(nnf(n.arg, true)) : A.dia(nnf(n.arg));
    default:
      return n;
  }
}

function flatten(n) {
  if (n.type === 'and' || n.type === 'or') {
    const parts = [];
    const collect = (m) => {
      if (m.type === n.type) { collect(m.left); collect(m.right); } else parts.push(flatten(m));
    };
    collect(n);
    const uniq = [...new Map(parts.map((p) => [canonicalKey(p), p])).entries()].sort(([a], [b]) => (a < b ? -1 : 1));
    return { type: n.type, parts: uniq.map(([, p]) => p) };
  }
  if (A.isQuant(n)) return { type: n.type, v: n.v, body: flatten(n.body) };
  if (A.isUnary(n)) return { type: n.type, arg: flatten(n.arg) };
  return n;
}

function canonicalKey(n) {
  if (n.parts) return `${n.type}[${n.parts.map(canonicalKey).join(',')}]`;
  if (n.body) return `${n.type}${n.v}.${canonicalKey(n.body)}`;
  if (n.arg) return `${n.type}(${canonicalKey(n.arg)})`;
  return A.key(n);
}

export function canonical(n) {
  return canonicalKey(flatten(nnf(rename(n))));
}

export function sameCanonical(a, b) {
  return canonical(a) === canonical(b);
}
