// One-way matching of rule schemas against formulas, and instantiation.
// Formula metavariables are { type: 'meta', name }. Term metavariables and
// bound-variable metavariables are strings beginning with '?'.

import * as A from './ast.js';

function bindTerm(pt, t, s) {
  if (!A.isTermMeta(pt)) return pt === t ? s : null;
  if (s.has(pt)) return s.get(pt) === t ? s : null;
  const next = new Map(s);
  next.set(pt, t);
  return next;
}

export function match(pat, n, s = new Map()) {
  if (s === null) return null;
  if (pat.type === 'meta') {
    if (s.has(pat.name)) return A.equal(s.get(pat.name), n) ? s : null;
    const next = new Map(s);
    next.set(pat.name, n);
    return next;
  }
  if (pat.type !== n.type) return null;
  switch (pat.type) {
    case 'atom':
      if (pat.pred !== n.pred || pat.terms.length !== n.terms.length) return null;
      return pat.terms.reduce((acc, t, i) => (acc ? bindTerm(t, n.terms[i], acc) : null), s);
    case 'eq': {
      const s1 = bindTerm(pat.left, n.left, s);
      return s1 ? bindTerm(pat.right, n.right, s1) : null;
    }
    case 'all':
    case 'some': {
      const s1 = bindTerm(pat.v, n.v, s);
      return s1 ? match(pat.body, n.body, s1) : null;
    }
    default: {
      const pk = A.children(pat);
      const nk = A.children(n);
      let acc = s;
      for (let i = 0; i < pk.length && acc; i++) acc = match(pk[i], nk[i], acc);
      return acc;
    }
  }
}

/** Build a formula from a schema; returns null if a metavariable is unbound. */
export function instantiate(pat, s) {
  const term = (t) => (A.isTermMeta(t) ? s.get(t) ?? null : t);
  switch (pat.type) {
    case 'meta':
      return s.get(pat.name) ?? null;
    case 'atom': {
      const ts = pat.terms.map(term);
      return ts.includes(null) ? null : A.atom(pat.pred, ts);
    }
    case 'eq': {
      const l = term(pat.left);
      const r = term(pat.right);
      return l === null || r === null ? null : A.eq(l, r);
    }
    case 'all':
    case 'some': {
      const v = term(pat.v);
      const b = instantiate(pat.body, s);
      return v === null || b === null ? null : A.quant(pat.type, v, b);
    }
    default: {
      const kids = A.children(pat).map((c) => instantiate(c, s));
      return kids.includes(null) ? null : A.withChildren(pat, kids);
    }
  }
}

/** Metavariable names (formula and term) occurring in a schema. */
export function metas(pat, out = new Set()) {
  if (pat.type === 'meta') out.add(pat.name);
  if (pat.type === 'atom') pat.terms.filter(A.isTermMeta).forEach((t) => out.add(t));
  if (pat.type === 'eq') [pat.left, pat.right].filter(A.isTermMeta).forEach((t) => out.add(t));
  if (A.isQuant(pat) && A.isTermMeta(pat.v)) out.add(pat.v);
  for (const c of A.children(pat)) metas(c, out);
  return out;
}
