import { test } from 'node:test';
import assert from 'node:assert/strict';
import { f } from '../src/logic/parser.js';
import { print } from '../src/logic/printer.js';
import {
  evaluate, valuations, truthTable, classifyStatement, relations, validity, consistency, equivalence, columns,
} from '../src/logic/semantics.js';

test('connective truth tables', () => {
  const T = true, F = false;
  const table = (text) => valuations(['A', 'B']).map((v) => evaluate(f(text), v));
  assert.deepEqual(table('A • B'), [T, F, F, F]);
  assert.deepEqual(table('A ∨ B'), [T, T, T, F]);
  assert.deepEqual(table('A ⊃ B'), [T, F, T, T]);
  assert.deepEqual(table('A ≡ B'), [T, F, F, T]);
  assert.deepEqual(table('~A'), [F, F, T, T]);
});

test('Hurley row order: first column half T then half F', () => {
  const rows = valuations(['A', 'B', 'C']);
  assert.equal(rows.length, 8);
  assert.deepEqual(rows.map((r) => r.A), [true, true, true, true, false, false, false, false]);
  assert.deepEqual(rows.map((r) => r.C), [true, false, true, false, true, false, true, false]);
});

test('statement classification', () => {
  assert.equal(classifyStatement(f('A ∨ ~A')), 'tautologous');
  assert.equal(classifyStatement(f('A • ~A')), 'self-contradictory');
  assert.equal(classifyStatement(f('A ⊃ B')), 'contingent');
  assert.equal(classifyStatement(f('[(A ⊃ B) • A] ⊃ B')), 'tautologous');
  assert.equal(classifyStatement(f('A ⊃ (B ⊃ A)')), 'tautologous');
});

test('relations between pairs (all that apply)', () => {
  assert.deepEqual(relations(f('A ⊃ B'), f('~A ∨ B')), ['equivalent', 'consistent']);
  assert.deepEqual(relations(f('A ⊃ B'), f('A • ~B')), ['contradictory', 'inconsistent']);
  assert.deepEqual(relations(f('A • B'), f('A ∨ B')), ['consistent']);
  assert.deepEqual(relations(f('A • B'), f('~A • ~B')), ['inconsistent']);
  // Two self-contradictions are equivalent and inconsistent.
  assert.deepEqual(relations(f('A • ~A'), f('B • ~B')), ['equivalent', 'inconsistent']);
});

test('validity and counterexamples', () => {
  assert.equal(validity([f('A ⊃ B'), f('A')], f('B')).valid, true);
  // Affirming the consequent.
  const ac = validity([f('A ⊃ B'), f('B')], f('A'));
  assert.equal(ac.valid, false);
  assert.deepEqual(ac.counterexamples, [{ A: false, B: true }]);
  // Denying the antecedent: the old site's imp3.
  const da = validity([f('A ⊃ B'), f('~A')], f('~B'));
  assert.equal(da.valid, false);
  // …and yet something does follow from A ⊃ B, ~A.
  assert.equal(validity([f('A ⊃ B'), f('~A')], f('~A ∨ B')).valid, true);
  // Explosion is classically valid.
  assert.equal(validity([f('A • ~A')], f('B')).valid, true);
});

test('consistency and equivalence', () => {
  assert.equal(consistency([f('A ⊃ B'), f('A'), f('~B')]).consistent, false);
  assert.equal(consistency([f('A ∨ B'), f('~A')]).consistent, true);
  assert.equal(equivalence(f('~(A • B)'), f('~A ∨ ~B')).equivalent, true);
  const e = equivalence(f('~(A • B)'), f('~A • ~B'));
  assert.equal(e.equivalent, false);
  assert.deepEqual(e.row, { A: true, B: false });
});

test('intermediate columns', () => {
  const cols = columns(f('(A ⊃ B) • ~(A ⊃ B)')).map((c) => print(c));
  assert.deepEqual(cols, ['A ⊃ B', '~(A ⊃ B)', '(A ⊃ B) • ~(A ⊃ B)']);
});

test('truthTable over several formulas', () => {
  const t = truthTable([f('A ⊃ B'), f('B')]);
  assert.deepEqual(t.letters, ['A', 'B']);
  assert.equal(t.rows.length, 4);
});
