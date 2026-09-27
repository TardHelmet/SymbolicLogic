import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFormula, parseArgument, parseList, f } from '../src/logic/parser.js';
import { print } from '../src/logic/printer.js';
import * as A from '../src/logic/ast.js';

const ok = (text, opts) => {
  const r = parseFormula(text, opts);
  assert.ok(r.ok, `expected “${text}” to parse: ${r.error?.message}`);
  return r.ast;
};
const bad = (text, opts) => {
  const r = parseFormula(text, opts);
  assert.ok(!r.ok, `expected “${text}” to be rejected`);
  return r.error;
};

test('connectives and aliases', () => {
  assert.equal(print(ok('A . B')), 'A • B');
  assert.equal(print(ok('A & B')), 'A • B');
  assert.equal(print(ok('A v B')), 'A ∨ B');
  assert.equal(print(ok('A | B')), 'A ∨ B');
  assert.equal(print(ok('A > B')), 'A ⊃ B');
  assert.equal(print(ok('A -> B')), 'A ⊃ B');
  assert.equal(print(ok('A → B')), 'A ⊃ B');
  assert.equal(print(ok('A <-> B')), 'A ≡ B');
  assert.equal(print(ok('A == B')), 'A ≡ B');
  assert.equal(print(ok('-A')), '~A');
  assert.equal(print(ok('¬A')), '~A');
  assert.equal(print(ok('~~A')), '~~A');
});

test('negation binds to the smallest formula', () => {
  const n = ok('~A • B');
  assert.equal(n.type, 'and');
  assert.equal(n.left.type, 'not');
  assert.equal(print(ok('~(A • B)')), '~(A • B)');
});

test('unbracketed chains are rejected with both bracketings offered', () => {
  const e = bad('A • B • C');
  assert.match(e.message, /Assoc/);
  assert.deepEqual(e.suggestions, ['(A • B) • C', 'A • (B • C)']);
  const e2 = bad('A ⊃ B ∨ C');
  assert.deepEqual(e2.suggestions, ['(A ⊃ B) ∨ C', 'A ⊃ (B ∨ C)']);
  assert.doesNotMatch(e2.message, /Assoc/);
});

test('bracket kinds must match; any kind may be used', () => {
  assert.equal(print(ok('[A ⊃ (B ∨ C)] • D')), '[A ⊃ (B ∨ C)] • D');
  assert.equal(print(ok('(A ⊃ (B ∨ C)) • D')), '[A ⊃ (B ∨ C)] • D');
  bad('(A • B]');
  bad('(A • B');
  bad('A • B)');
});

test('printer brackets by height: ( ) then [ ] then { }', () => {
  assert.equal(print(ok('((A • B) ⊃ C) ∨ D')), '[(A • B) ⊃ C] ∨ D');
  assert.equal(print(ok('(((A • B) ⊃ C) ∨ D) ≡ E')), '{[(A • B) ⊃ C] ∨ D} ≡ E');
  assert.equal(print(ok('(x)(Fx ⊃ (Ey)(Gy • Rxy))')), '(x)[Fx ⊃ (∃y)(Gy • Rxy)]');
});

test('quantifier forms', () => {
  const u = ok('(x)(Fx ⊃ Gx)');
  assert.equal(u.type, 'all');
  assert.equal(u.v, 'x');
  assert.equal(ok('(∃x)Fx').type, 'some');
  assert.equal(ok('∃x Fx').type, 'some');
  assert.equal(ok('∀x(Fx ⊃ Gx)').type, 'all');
  assert.equal(ok('(∀y)Fy').type, 'all');
});

test('(Ex) is a quantifier exactly when a formula follows', () => {
  const a = ok('(Ex)(Ex)');
  assert.equal(a.type, 'some');
  assert.equal(a.body.type, 'atom');
  assert.equal(a.body.pred, 'E');
  const b = ok('(Ex) • (Ex)Fx', {});
  // Parsed as an open formula: first conjunct is the atom Ex.
  assert.equal(b.type, 'and');
  assert.equal(b.left.type, 'atom');
  assert.equal(b.right.type, 'some');
  const c = ok('~(Ex)');
  assert.equal(c.type, 'not');
  assert.equal(c.arg.type, 'atom');
  const d = ok('(Ex)x = a');
  assert.equal(d.type, 'some');
  assert.equal(d.body.type, 'eq');
  const g = ok('(x)(x = y)');
  assert.equal(g.type, 'all');
  assert.equal(g.body.type, 'eq');
  assert.equal(ok('(Ea)').type, 'atom');
});

test('targeted errors', () => {
  assert.match(bad('(X)Fx').message, /lowercase/);
  assert.match(bad('A = B').message, /≡/);
  assert.match(bad('Fv').hint, /wedge/);
  assert.match(bad('A V B').message, /wedge/);
  assert.match(bad('(a)Fa').message, /variable/);
  assert.match(bad('A B').message, /no connective/);
  assert.match(bad('Fx', { closed: true }).message, /free/);
  assert.match(bad('Fa • F').message, /statement letter/);
  assert.match(bad('□A').message, /Part III/);
  assert.equal(ok('□A ⊃ ◇A', { modal: true }).type, 'imp');
  assert.equal(ok('[]A -> <>A', { modal: true }).type, 'imp');
});

test('identity', () => {
  const n = ok('~a = b');
  assert.equal(n.type, 'not');
  assert.equal(n.arg.type, 'eq');
  assert.equal(print(n), '~(a = b)');
  assert.equal(print(ok('a != b')), '~(a = b)');
  assert.equal(print(ok('(x)(Fx ⊃ x = a)')), '(x)(Fx ⊃ x = a)');
  assert.equal(print(ok('(∃x)[Fx • (y)(Fy ⊃ y = x)]')), '(∃x)[Fx • (y)(Fy ⊃ y = x)]');
});

test('relational atoms and arity checks', () => {
  const n = ok('(x)(∃y)Lxy');
  assert.equal(n.body.body.terms.join(''), 'xy');
  const r = parseArgument('Fa, Fab / Fb');
  assert.ok(!r.ok);
  assert.match(r.error.message, /1-place/);
});

test('arguments and lists', () => {
  const r = parseArgument('A ⊃ B, A / B');
  assert.ok(r.ok);
  assert.equal(r.premises.length, 2);
  assert.equal(print(r.conclusion), 'B');
  const r2 = parseArgument('A ⊃ B, A ∴ B');
  assert.ok(r2.ok);
  const r3 = parseArgument('/ A ∨ ~A');
  assert.ok(r3.ok);
  assert.equal(r3.premises.length, 0);
  const l = parseList('A, B ⊃ C, ~D');
  assert.ok(l.ok);
  assert.equal(l.items.length, 3);
});

test('schemas: p q r s are metavariables', () => {
  const s = f('p ⊃ q', { schema: true });
  assert.equal(s.left.type, 'meta');
  const o = f('Fp');
  assert.deepEqual(o.terms, ['p']);
});

test('modern printing', () => {
  assert.equal(print(ok('(x)(Fx ⊃ ~Gx)'), { notation: 'modern' }), '∀x(Fx → ¬Gx)');
  assert.equal(print(ok('(A • B) ≡ ~C'), { notation: 'modern' }), '(A ∧ B) ↔ ¬C');
});

// Seeded random formulas: printing then parsing gives back the same tree.
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
}

function randomFormula(r, depth, bound = []) {
  const pick = (xs) => xs[Math.floor(r() * xs.length)];
  if (depth === 0 || r() < 0.2) {
    const k = r();
    if (k < 0.3) return A.atom(pick(['A', 'B', 'C', 'D']));
    const terms = [...bound, 'a', 'b'];
    if (k < 0.5 && terms.length) return A.eq(pick(terms), pick(terms));
    const pred = pick(['F', 'G', 'R']);
    const arity = pred === 'R' ? 2 : 1;
    return A.atom(pred, Array.from({ length: arity }, () => pick(terms)));
  }
  const k = r();
  if (k < 0.2) return A.not(randomFormula(r, depth - 1, bound));
  if (k < 0.35) {
    const v = pick(['x', 'y', 'z']);
    return A.quant(pick(['all', 'some']), v, randomFormula(r, depth - 1, [...bound, v]));
  }
  return A.binary(pick(['and', 'or', 'imp', 'iff']), randomFormula(r, depth - 1, bound), randomFormula(r, depth - 1, bound));
}

test('round trip: parse(print(φ)) = φ, in both notations', () => {
  const r = rng(42);
  for (let i = 0; i < 400; i++) {
    const phi = randomFormula(r, 5);
    for (const notation of ['hurley', 'modern']) {
      const text = print(phi, { notation });
      const back = parseFormula(text);
      assert.ok(back.ok, `failed to reparse ${text}: ${back.error?.message}`);
      assert.ok(A.equal(back.ast, phi), `round trip changed ${text} → ${print(back.ast)}`);
    }
  }
});
