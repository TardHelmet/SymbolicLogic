// Formula trees. Nodes are plain frozen objects so they can be shared,
// compared structurally, and used as memo keys by identity.
//
// Formula nodes:
//   { type: 'atom', pred: 'F', terms: ['x', 'a'] }   statement letter when terms is empty
//   { type: 'eq', left: 'a', right: 'b' }            identity
//   { type: 'not', arg }
//   { type: 'and' | 'or' | 'imp' | 'iff', left, right }
//   { type: 'all' | 'some', v: 'x', body }
//   { type: 'box' | 'dia', arg }                      modal operators (Part III)
//   { type: 'meta', name: 'p' }                       formula metavariable (rule schemas only)
//
// Terms are strings: variables x y z, constants a–u and w. In schemas a
// term or bound variable beginning with '?' is a term metavariable.

export const BINARY = ['and', 'or', 'imp', 'iff'];
export const QUANT = ['all', 'some'];
export const UNARY = ['not', 'box', 'dia'];

export const isBinary = (n) => BINARY.includes(n.type);
export const isQuant = (n) => QUANT.includes(n.type);
export const isUnary = (n) => UNARY.includes(n.type);

export const isVar = (t) => /^[xyz]$/.test(t);
export const isConst = (t) => /^[a-uw]$/.test(t);
export const isTermMeta = (t) => typeof t === 'string' && t.startsWith('?');

const f = Object.freeze;

export const atom = (pred, terms = []) => f({ type: 'atom', pred, terms: f([...terms]) });
export const eq = (left, right) => f({ type: 'eq', left, right });
export const not = (arg) => f({ type: 'not', arg });
export const and = (left, right) => f({ type: 'and', left, right });
export const or = (left, right) => f({ type: 'or', left, right });
export const imp = (left, right) => f({ type: 'imp', left, right });
export const iff = (left, right) => f({ type: 'iff', left, right });
export const all = (v, body) => f({ type: 'all', v, body });
export const some = (v, body) => f({ type: 'some', v, body });
export const box = (arg) => f({ type: 'box', arg });
export const dia = (arg) => f({ type: 'dia', arg });
export const meta = (name) => f({ type: 'meta', name });

export function binary(type, left, right) {
  return f({ type, left, right });
}

export function unary(type, arg) {
  return f({ type, arg });
}

export function quant(type, v, body) {
  return f({ type, v, body });
}

/** Direct subformulas, in left-to-right order. */
export function children(n) {
  if (isBinary(n)) return [n.left, n.right];
  if (isUnary(n)) return [n.arg];
  if (isQuant(n)) return [n.body];
  return [];
}

/** Rebuild a node of the same kind with new children. */
export function withChildren(n, kids) {
  if (isBinary(n)) return binary(n.type, kids[0], kids[1]);
  if (isUnary(n)) return unary(n.type, kids[0]);
  if (isQuant(n)) return quant(n.type, n.v, kids[0]);
  return n;
}

export function equal(a, b) {
  if (a === b) return true;
  if (!a || !b || a.type !== b.type) return false;
  switch (a.type) {
    case 'atom':
      return a.pred === b.pred && a.terms.length === b.terms.length &&
        a.terms.every((t, i) => t === b.terms[i]);
    case 'eq':
      return a.left === b.left && a.right === b.right;
    case 'meta':
      return a.name === b.name;
    case 'all':
    case 'some':
      return a.v === b.v && equal(a.body, b.body);
    default:
      if (isBinary(a)) return equal(a.left, b.left) && equal(a.right, b.right);
      if (isUnary(a)) return equal(a.arg, b.arg);
      return false;
  }
}

export function size(n) {
  return 1 + children(n).reduce((s, c) => s + size(c), 0);
}

/** Terms occurring in an atomic node. */
function atomicTerms(n) {
  if (n.type === 'atom') return n.terms;
  if (n.type === 'eq') return [n.left, n.right];
  return [];
}

export function freeVars(n, bound = new Set(), out = new Set()) {
  if (n.type === 'atom' || n.type === 'eq') {
    for (const t of atomicTerms(n)) if (isVar(t) && !bound.has(t)) out.add(t);
    return out;
  }
  if (isQuant(n)) {
    const had = bound.has(n.v);
    bound.add(n.v);
    freeVars(n.body, bound, out);
    if (!had) bound.delete(n.v);
    return out;
  }
  for (const c of children(n)) freeVars(c, bound, out);
  return out;
}

export function isClosed(n) {
  return freeVars(n).size === 0;
}

/** Every term (free or bound variable, or constant) appearing in atoms. */
export function allTerms(n, out = new Set()) {
  for (const t of atomicTerms(n)) out.add(t);
  for (const c of children(n)) allTerms(c, out);
  return out;
}

export function constants(n, out = new Set()) {
  for (const t of atomicTerms(n)) if (isConst(t)) out.add(t);
  for (const c of children(n)) constants(c, out);
  return out;
}

/** Statement letters (0-place atoms), in order of first appearance. */
export function letters(n, out = []) {
  if (n.type === 'atom' && n.terms.length === 0) {
    if (!out.includes(n.pred)) out.push(n.pred);
  }
  for (const c of children(n)) letters(c, out);
  return out;
}

/** Map predicate letter → arity, over atoms with at least one term. */
export function predicates(n, out = new Map()) {
  if (n.type === 'atom' && n.terms.length > 0) out.set(n.pred, n.terms.length);
  for (const c of children(n)) predicates(c, out);
  return out;
}

export function hasQuantifiers(n) {
  if (isQuant(n)) return true;
  return children(n).some(hasQuantifiers);
}

export function hasIdentity(n) {
  if (n.type === 'eq') return true;
  return children(n).some(hasIdentity);
}

export function hasModal(n) {
  if (n.type === 'box' || n.type === 'dia') return true;
  return children(n).some(hasModal);
}

export function isFirstOrder(n) {
  if (n.type === 'eq') return true;
  if (n.type === 'atom' && n.terms.length > 0) return true;
  if (isQuant(n)) return true;
  return children(n).some(isFirstOrder);
}

export function quantifierDepth(n) {
  const inner = Math.max(0, ...children(n).map(quantifierDepth));
  return isQuant(n) ? inner + 1 : inner;
}

/**
 * Replace free occurrences of variable x by term t. No renaming: callers
 * that need soundness must check freeFor(n, x, t) first.
 */
export function subst(n, x, t) {
  switch (n.type) {
    case 'atom':
      return n.terms.some((s) => s === x) ? atom(n.pred, n.terms.map((s) => (s === x ? t : s))) : n;
    case 'eq':
      return n.left === x || n.right === x
        ? eq(n.left === x ? t : n.left, n.right === x ? t : n.right)
        : n;
    case 'all':
    case 'some':
      return n.v === x ? n : quant(n.type, n.v, subst(n.body, x, t));
    case 'meta':
      return n;
    default: {
      const kids = children(n);
      const next = kids.map((c) => subst(c, x, t));
      return next.every((c, i) => c === kids[i]) ? n : withChildren(n, next);
    }
  }
}

/**
 * Is term t free for variable x in n? True when no free occurrence of x in
 * n lies inside the scope of a quantifier binding t.
 */
export function freeFor(n, x, t, bound = new Set()) {
  if (!isVar(t)) return true;
  if (n.type === 'atom' || n.type === 'eq') {
    const occurs = atomicTerms(n).includes(x);
    return !(occurs && bound.has(t));
  }
  if (isQuant(n)) {
    if (n.v === x) return true; // x is not free below here
    const had = bound.has(n.v);
    bound.add(n.v);
    const ok = freeFor(n.body, x, t, bound);
    if (!had) bound.delete(n.v);
    return ok;
  }
  return children(n).every((c) => freeFor(c, x, t, bound));
}

/** Visit every subformula with its path (array of child indexes). */
export function* subformulas(n, path = []) {
  yield [n, path];
  const kids = children(n);
  for (let i = 0; i < kids.length; i++) yield* subformulas(kids[i], [...path, i]);
}

export function at(n, path) {
  let cur = n;
  for (const i of path) cur = children(cur)[i];
  return cur;
}

export function replaceAt(n, path, repl) {
  if (path.length === 0) return repl;
  const kids = [...children(n)];
  kids[path[0]] = replaceAt(kids[path[0]], path.slice(1), repl);
  return withChildren(n, kids);
}

/** Stable string key; used for memoisation and dedupe. */
export function key(n) {
  switch (n.type) {
    case 'atom': return n.terms.length ? `${n.pred}(${n.terms.join(',')})` : n.pred;
    case 'eq': return `(${n.left}=${n.right})`;
    case 'meta': return `?${n.name}`;
    case 'not': return `~${key(n.arg)}`;
    case 'box': return `□${key(n.arg)}`;
    case 'dia': return `◇${key(n.arg)}`;
    case 'all': return `A${n.v}.${key(n.body)}`;
    case 'some': return `E${n.v}.${key(n.body)}`;
    default: return `(${key(n.left)} ${n.type} ${key(n.right)})`;
  }
}
