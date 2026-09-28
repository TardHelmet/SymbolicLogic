import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as Al from '../src/logic/algebra.js';
import * as FO from '../src/logic/models.js';

const E = (s) => {
  const r = Al.parseEquation(s);
  assert.ok(r.ok, `${s}: ${r.error?.message}`);
  return r.eq;
};
const derive = (goal, lines, opts) => Al.checkDerivation({ goal: E(goal), lines: lines.map(([text, just]) => ({ text, just })) }, opts);
const complete = (goal, lines, opts) => {
  const r = derive(goal, lines, opts);
  assert.ok(r.complete, `${goal}: ${r.problems.join(' ')} ${r.lines.map((l) => l.errors.join(' ')).join(' | ')}`);
};
const lineError = (goal, lines, n, pattern, opts) => {
  const r = derive(goal, lines, opts);
  const errs = r.lines[n - 1].errors.join(' ');
  assert.match(errs, pattern);
};

test('terms: Langer’s notation, precedence, and no unbracketed chains', () => {
  assert.equal(Al.printTerm(Al.parseTerm('a + bc').term), 'a + (b × c)');
  assert.equal(Al.printTerm(Al.parseTerm('-(a+b) * c').term), '−(a + b) × c');
  assert.equal(Al.printTerm(Al.parseTerm('−−a').term), '−(−a)');
  assert.ok(!Al.parseTerm('a + b + c').ok);
  assert.ok(!Al.parseTerm('a × b × c').ok);
  assert.ok(!Al.parseTerm('a ⊃ b').ok);
});

test('every law is an identity of the two-element algebra', () => {
  for (const [id, l] of Object.entries(Al.LAWS)) {
    for (const s of l.statements) assert.ok(Al.holdsInTwo(E(s)).holds, `${id}: ${s}`);
  }
  assert.ok(!Al.holdsInTwo(E('a + b = a')).holds);
});

test('Langer’s proof of Theorem 2b, a × a = a, step by step (ch. IX)', () => {
  complete('a × a = a', [
    ['a = a × 1', 'IIb'],
    ['a = a × (a + −a)', '1, V'],
    ['a = (a × a) + (a × −a)', '2, IVb'],
    ['a = (a × a) + 0', '3, V'],
    ['a = a × a', '4, IIa'],
  ]);
});

test('Langer’s proof of Theorem 4b (absorption) uses Theorem 3b', () => {
  complete('a × (a + b) = a', [
    ['a × (a + b) = (a + 0) × (a + b)', 'IIa'],
    ['a × (a + b) = a + (0 × b)', '1, IVa'],
    ['a × (a + b) = a + (b × 0)', '2, IIIb'],
    ['a × (a + b) = a + 0', '3, Th. 3b'],
    ['a × (a + b) = a', '4, IIa'],
  ], { laws: [...Al.POSTULATES, '3b'] });
});

test('double negation through the uniqueness of the complement', () => {
  complete('a = −(−a)', [
    ['a + −a = 1', 'V'],
    ['−a + a = 1', '1, IIIa'],
    ['a × −a = 0', 'V'],
    ['−a × a = 0', '3, IIIb'],
    ['a = −(−a)', 'Compl 2, 4'],
  ]);
});

test('diagnoses: wrong law, false step, two steps at once, unavailable theorem', () => {
  lineError('a × a = a', [['a = a × 1', 'IIa']], 1, /by IIb, not IIa/);
  lineError('a + 1 = 1', [['a + 1 = a', 'IIa']], 1, /false in the algebra of two classes/);
  lineError('a × a = a', [['a = a × 1', 'IIb'], ['a = (a × a) + (a × −a)', '1, V']], 2, /not one application|IVb/);
  lineError('a × a = a', [['a = a × a', '2b']], 1, /not available/);
  lineError('a × a = a', [['a × 1 = a', 'IIb'], ['a = 1', '1, Sym']], 2, /Sym turns/);
});

test('duality: exchanging + and ×, 0 and 1', () => {
  assert.equal(Al.printEquation(Al.dual(E('a + 0 = a'))), 'a × 1 = a');
  assert.equal(Al.printEquation(Al.dual(E('−(a + b) = −a × −b'))), '−(a × b) = −a + −b');
  // The dual of every law holds too.
  for (const l of Object.values(Al.LAWS)) for (const s of l.statements) assert.ok(Al.holdsInTwo(Al.dual(E(s))).holds, s);
});

test('a finite algebra: the three-valued one fails only postulate V', () => {
  const K3 = Al.algebraFrom({
    elements: ['0', '½', '1'], zero: '0', one: '1',
    plus: [['0', '½', '1'], ['½', '½', '1'], ['1', '1', '1']],
    times: [['0', '0', '0'], ['0', '½', '½'], ['0', '½', '1']],
    comp: ['1', '½', '0'],
  });
  const r = Al.checkPostulates(K3);
  assert.deepEqual(Object.keys(r).filter((k) => !r[k].holds), ['V']);
  assert.equal(r.V.env.a, '½');
  assert.ok(Object.values(Al.checkPostulates(Al.TWO)).every((x) => x.holds));
});

test('class equations: categorical propositions and the syllogism', () => {
  const F = (s) => Al.classFormula(E(s));
  // Barbara holds; the undistributed middle does not.
  assert.ok(FO.validity([F('m × −p = 0'), F('s × −m = 0')], F('s × −p = 0')).valid);
  assert.ok(!FO.validity([F('p × −m = 0'), F('s × −m = 0')], F('s × −p = 0')).valid);
  // A and O are contradictories; A does not imply I without existential import.
  assert.ok(FO.compare(F('s × −p = 0'), { type: 'not', arg: F('s × −p ≠ 0') }).equivalent);
  assert.ok(!FO.validity([F('s × −p = 0')], F('s × p ≠ 0')).valid);
});
