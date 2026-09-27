import { test } from 'node:test';
import assert from 'node:assert/strict';
import { f, schema } from '../src/logic/parser.js';
import { print } from '../src/logic/printer.js';
import {
  IMPLICATION, REPLACEMENT, fitsImplication, replacementCost, diagnoseImplication, diagnoseReplacement,
  resolveRule, oneStep, INTUITIONISTICALLY_REJECTED,
} from '../src/logic/rules.js';
import { classifyStatement, validity } from '../src/logic/semantics.js';
import * as A from '../src/logic/ast.js';

test('every implication rule is valid', () => {
  for (const [id, r] of Object.entries(IMPLICATION)) {
    const v = validity(r.premisePats, r.conclusionPat);
    assert.ok(v.valid, `${id} is not valid`);
  }
});

test('every replacement form is a tautological biconditional', () => {
  for (const [id, r] of Object.entries(REPLACEMENT)) {
    if (id === 'CQ') continue;
    for (const [l, rt] of r.formPats) {
      assert.equal(classifyStatement(A.iff(l, rt)), 'tautologous', `${id}: ${print(l)} :: ${print(rt)}`);
    }
  }
});

test('intuitionistically rejected directions are classically valid', () => {
  for (const x of INTUITIONISTICALLY_REJECTED) {
    assert.ok(validity([x.fromPat], x.toPat).valid);
  }
});

test('implication rules match whole lines, in any citation order', () => {
  assert.ok(fitsImplication('MP', [f('A ⊃ B'), f('A')], f('B')));
  assert.ok(fitsImplication('MP', [f('A'), f('A ⊃ B')], f('B')));
  assert.ok(fitsImplication('MT', [f('(A • B) ⊃ C'), f('~C')], f('~(A • B)')));
  assert.ok(fitsImplication('CD', [f('(A ⊃ B) • (C ⊃ D)'), f('A ∨ C')], f('B ∨ D')));
  assert.ok(fitsImplication('Add', [f('A')], f('A ∨ (B ≡ C)')));
  assert.ok(!fitsImplication('Simp', [f('A • B')], f('B')), 'Hurley’s Simp takes the left conjunct only');
  assert.ok(!fitsImplication('DS', [f('A ∨ B'), f('~B')], f('A')), 'Hurley’s DS negates the left disjunct only');
  assert.ok(!fitsImplication('MP', [f('(A ⊃ B) • C'), f('A')], f('B')));
});

test('implication diagnostics', () => {
  const ac = diagnoseImplication('MP', [f('A ⊃ B'), f('B')], f('A'), [1, 2]);
  assert.match(ac.join(' '), /affirming the consequent/);
  const da = diagnoseImplication('MT', [f('A ⊃ B'), f('~A')], f('~B'), [1, 2]);
  assert.match(da.join(' '), /denying the antecedent/);
  const simp = diagnoseImplication('Simp', [f('A • B')], f('B'), [1]);
  assert.match(simp.join(' '), /Com/);
  const dn = diagnoseImplication('MT', [f('~A ⊃ B'), f('~B')], f('A'), [1, 2]);
  assert.match(dn.join(' '), /~~A/);
  const part = diagnoseImplication('Simp', [f('(A • B) ⊃ C')], f('A ⊃ C'), [1]);
  assert.match(part.join(' '), /whole lines/);
  const other = diagnoseImplication('MP', [f('A ∨ B'), f('~A')], f('B'), [1, 2]);
  assert.match(other.join(' '), /by DS/);
  const nofollow = diagnoseImplication('MP', [f('A ⊃ B'), f('C')], f('B'), [1, 2]);
  assert.match(nofollow.join(' '), /does not follow/);
});

test('replacement: rewrites at the root', () => {
  assert.equal(replacementCost('Com', f('A • B'), f('B • A')), 1);
  assert.equal(replacementCost('Assoc', f('(A • B) • C'), f('A • (B • C)')), 1);
  assert.equal(replacementCost('Trans', f('A ⊃ B'), f('~B ⊃ ~A')), 1);
  assert.equal(replacementCost('Exp', f('(A • B) ⊃ C'), f('A ⊃ (B ⊃ C)')), 1);
  assert.equal(replacementCost('Taut', f('A ∨ B'), f('(A ∨ B) ∨ (A ∨ B)')), 1);
  assert.equal(replacementCost('DM', f('~(A • B)'), f('~A ∨ ~B')), 1);
  assert.equal(replacementCost('DM', f('~A • ~B'), f('~(A ∨ B)')), 1);
  assert.equal(replacementCost('Equiv', f('A ≡ B'), f('(A • B) ∨ (~A • ~B)')), 1);
  assert.equal(replacementCost('Dist', f('A • (B ∨ C)'), f('(A • B) ∨ (A • C)')), 1);
  assert.equal(replacementCost('Impl', f('~A ∨ B'), f('A ⊃ B')), 1);
});

test('replacement: rewrites inside a line, and several at once', () => {
  assert.equal(replacementCost('Com', f('(A • B) ⊃ C'), f('(B • A) ⊃ C')), 1);
  assert.equal(replacementCost('Com', f('(A • B) ∨ (C • D)'), f('(B • A) ∨ (D • C)')), 2);
  assert.equal(replacementCost('Com', f('(A • B) ∨ C'), f('C ∨ (B • A)')), 2);
  assert.equal(replacementCost('DN', f('A'), f('~~~~A')), 2);
  assert.equal(replacementCost('DN', f('A ⊃ B'), f('~~A ⊃ ~~B')), 2);
  assert.equal(replacementCost('DM', f('~(A • B) ⊃ C'), f('(~A ∨ ~B) ⊃ C')), 1);
});

test('replacement: wrong rules and non-equivalences are rejected', () => {
  assert.equal(replacementCost('Com', f('A ⊃ B'), f('B ⊃ A')), Infinity);
  assert.equal(replacementCost('Assoc', f('(A • B) ∨ C'), f('A • (B ∨ C)')), Infinity);
  assert.equal(replacementCost('Com', f('A ≡ B'), f('B ≡ A')), Infinity, 'Com covers • and ∨ only');
  assert.equal(replacementCost('Dist', f('(A ∨ B) • C'), f('(A • C) ∨ (B • C)')), Infinity, 'left distribution only');
  assert.equal(replacementCost('DM', f('~(A • B)'), f('~A • ~B')), Infinity);
});

test('replacement diagnostics', () => {
  assert.match(diagnoseReplacement('Assoc', f('A • B'), f('B • A')).join(' '), /Com, not Assoc/);
  assert.match(diagnoseReplacement('DM', f('~(A • ~B)'), f('~A ∨ B')).join(' '), /two steps/);
  assert.match(diagnoseReplacement('DM', f('~(A • B)'), f('~A • ~B')).join(' '), /not even equivalent/);
  assert.match(diagnoseReplacement('Com', f('A'), f('A')).join(' '), /identical/);
});

test('CQ and quantified replacement', () => {
  assert.equal(replacementCost('CQ', f('~(x)Fx'), f('(∃x)~Fx')), 1);
  assert.equal(replacementCost('CQ', f('(x)(Fx ⊃ Gx)'), f('~(∃x)~(Fx ⊃ Gx)')), 1);
  assert.equal(replacementCost('CQ', f('~(∃x)(Fx • Gx)'), f('(x)~(Fx • Gx)')), 1);
  assert.equal(replacementCost('CQ', f('~(x)Fx'), f('(∃y)~Fy')), Infinity, 'CQ keeps the same variable');
  assert.equal(replacementCost('Com', f('(x)(Fx • Gx)'), f('(y)(Gy • Fy)')), Infinity, 'labels include the bound variable');
  assert.equal(replacementCost('Com', f('(x)(Fx • Gx)'), f('(x)(Gx • Fx)')), 1);
  assert.equal(replacementCost('IdSym', f('a = b'), f('b = a')), 1);
  assert.equal(replacementCost('IdSym', f('Fa ⊃ a = b'), f('Fa ⊃ b = a')), 1);
});

test('one-step rewrites', () => {
  const outs = oneStep('DM', f('~(A • B)')).map((o) => print(o));
  assert.deepEqual(outs, ['~A ∨ ~B']);
  assert.ok(oneStep('DN', f('A • B')).map((o) => print(o)).includes('~~(A • B)'));
});

test('rule names resolve with aliases and suggestions', () => {
  assert.equal(resolveRule('M.P.').id, 'MP');
  assert.equal(resolveRule('De Morgan').id, 'DM');
  assert.equal(resolveRule('contra').id, 'Trans');
  assert.equal(resolveRule('QN').id, 'CQ');
  assert.equal(resolveRule('Simpp').suggestion, 'Simp');
  assert.ok(resolveRule('Wibble').error);
});

test('schemas parse with metavariables', () => {
  assert.equal(schema('p ⊃ q').left.type, 'meta');
});
