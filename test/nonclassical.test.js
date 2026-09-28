import { test } from 'node:test';
import assert from 'node:assert/strict';
import { f, schema } from '../src/logic/parser.js';
import * as MV from '../src/logic/manyvalued.js';
import * as K from '../src/logic/kripke.js';
import { INTUITIONISTICALLY_REJECTED } from '../src/logic/rules.js';

const m = (t) => f(t, { modal: true });

test('three-valued tables match the published matrices', () => {
  const N = 0.5;
  const row = (logic, text, vals) => MV.valuations(['A', 'B']).map((v) => MV.evaluate(logic, f(text), v)).forEach((x, i) => assert.equal(x, vals[i], `${logic} ${text} row ${i}`));
  // Rows: TT TN TF NT NN NF FT FN FF
  row('K3', 'A ∨ B', [1, 1, 1, 1, N, N, 1, N, 0]);
  row('K3', 'A • B', [1, N, 0, N, N, 0, 0, 0, 0]);
  row('K3', 'A ⊃ B', [1, N, 0, 1, N, N, 1, 1, 1]);
  row('L3', 'A ⊃ B', [1, N, 0, 1, 1, N, 1, 1, 1]);
  row('WK', 'A ∨ B', [1, N, 1, N, N, N, 1, N, 0]);
  assert.deepEqual(MV.valuations(['A']).map((v) => MV.evaluate('K3', f('~A'), v)), [0, N, 1]);
});

test('LP: explosion, MP and DS fail; excluded middle holds', () => {
  assert.equal(MV.validity('LP', [f('A • ~A')], f('B')).valid, false);
  assert.equal(MV.validity('LP', [f('A ⊃ B'), f('A')], f('B')).valid, false);
  assert.equal(MV.validity('LP', [f('A ∨ B'), f('~A')], f('B')).valid, false);
  assert.equal(MV.tautology('LP', f('A ∨ ~A')), true);
  // The other steps of the explosion proof survive in LP.
  assert.equal(MV.validity('LP', [f('A • ~A')], f('A')).valid, true);
  assert.equal(MV.validity('LP', [f('A')], f('A ∨ B')).valid, true);
});

test('K3: excluded middle fails, explosion holds', () => {
  assert.equal(MV.tautology('K3', f('A ∨ ~A')), false);
  assert.equal(MV.validity('K3', [f('A • ~A')], f('B')).valid, true);
  assert.equal(MV.validity('K3', [f('A ⊃ B'), f('A')], f('B')).valid, true);
  assert.equal(MV.tautology('K3', f('A ⊃ A')), false);
});

test('weak Kleene: addition fails; Ł3: A ⊃ A holds but excluded middle fails', () => {
  assert.equal(MV.validity('WK', [f('A')], f('A ∨ B')).valid, false);
  assert.equal(MV.tautology('L3', f('A ⊃ A')), true);
  assert.equal(MV.tautology('L3', f('A ∨ ~A')), false);
});

test('the Liar in K3 and LP', () => {
  const liar = f('L ≡ ~L');
  assert.equal(MV.evaluate('K3', liar, { L: 0.5 }), 0.5);
  assert.equal(MV.designated('LP', MV.evaluate('LP', liar, { L: 0.5 })), true);
});

test('modal frames: T, S4, S5', () => {
  assert.equal(K.validity('K', [], m('□A ⊃ A')).valid, false);
  assert.equal(K.validity('T', [], m('□A ⊃ A')).valid, true);
  assert.equal(K.validity('T', [], m('□A ⊃ □□A')).valid, false);
  assert.equal(K.validity('S4', [], m('□A ⊃ □□A')).valid, true);
  assert.equal(K.validity('S4', [], m('◇A ⊃ □◇A')).valid, false);
  assert.equal(K.validity('S5', [], m('◇A ⊃ □◇A')).valid, true);
  assert.equal(K.validity('K', [], m('□(A ⊃ B) ⊃ (□A ⊃ □B)')).valid, true);
});

test('Hartshorne: valid in S5, not in S4', () => {
  const premises = [m('□(G ⊃ □G)'), m('◇G')];
  assert.equal(K.validity('S5', premises, m('□G')).valid, true);
  const c = K.validity('S4', premises, m('□G'));
  assert.equal(c.valid, false);
  assert.deepEqual(K.frameProblems('S4', c.model), []);
});

test('intuitionistic logic', () => {
  assert.equal(K.validity('INT', [], f('A ∨ ~A')).valid, false);
  assert.equal(K.validity('INT', [f('~~A')], f('A')).valid, false);
  assert.equal(K.validity('INT', [f('A')], f('~~A')).valid, true);
  assert.equal(K.validity('INT', [], f('~(A • ~A)')).valid, true);
  assert.equal(K.validity('INT', [f('~(A ∨ B)')], f('~A • ~B')).valid, true);
  assert.equal(K.validity('INT', [f('A ∨ B'), f('~A')], f('B')).valid, true);
  const c = K.validity('INT', [], f('A ∨ ~A'));
  assert.deepEqual(K.frameProblems('INT', c.model), []);
});

test('every intuitionistically rejected direction has a countermodel, and its converse does not', () => {
  for (const x of INTUITIONISTICALLY_REJECTED) {
    assert.equal(K.validity('INT', [x.fromPat], x.toPat).valid, false, `${x.rule}: ${x.from} ⊢ ${x.to}`);
  }
  // Directions an intuitionist accepts.
  for (const [a, b] of [['p', '~~p'], ['~p ∨ ~q', '~(p • q)'], ['~p ∨ q', 'p ⊃ q'], ['p ⊃ q', '~q ⊃ ~p'], ['(p • q) ∨ (~p • ~q)', 'p ≡ q']]) {
    assert.equal(K.validity('INT', [schema(a)], schema(b)).valid, true, `${a} ⊢ ${b}`);
  }
});

test('frame problems are named', () => {
  const model = K.fromData({ worlds: ['1', '2'], R: [['1', '2']], V: { A: ['1'] } });
  assert.deepEqual(K.frameProblems('S4', model), ['reflexive']);
  assert.deepEqual(K.frameProblems('INT', model).sort(), ['persistent', 'reflexive']);
  assert.match(K.describe(model), /1→2/);
});
