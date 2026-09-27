import { test } from 'node:test';
import assert from 'node:assert/strict';
import { f } from '../src/logic/parser.js';
import { compare, validity, evaluate, describeModel, satisfiable } from '../src/logic/models.js';
import { canonical } from '../src/logic/normalize.js';

test('canonical forms identify simple equivalents', () => {
  assert.equal(canonical(f('(x)(Fx ⊃ Gx)')), canonical(f('(y)(~Fy ∨ Gy)')));
  assert.equal(canonical(f('~(∃x)(Fx • ~Gx)')), canonical(f('(x)(Fx ⊃ Gx)')));
  assert.equal(canonical(f('A • (B • C)')), canonical(f('(C • B) • A')));
  assert.notEqual(canonical(f('(x)Fx')), canonical(f('(∃x)Fx')));
});

test('monadic equivalence is decided', () => {
  const r = compare(f('(x)(Fx ⊃ Gx)'), f('(x)(Gx ⊃ Fx)'));
  assert.equal(r.equivalent, false);
  const s = compare(f('(∃x)(Fx • Gx)'), f('(∃x)Fx • (∃x)Gx'));
  assert.equal(s.equivalent, false);
  assert.equal(compare(f('(x)(Fx • Gx)'), f('(x)Fx • (x)Gx')).certainty, 'proved');
  assert.equal(compare(f('(x)(Fx • Gx)'), f('(x)Fx • (x)Gx')).equivalent, true);
});

test('numerical statements with identity are told apart', () => {
  const three = f('(∃x)(∃y)(∃z)[(Fx • Fy) • (Fz • [(~x = y • ~x = z) • ~y = z])]');
  const two = f('(∃x)(∃y)[(Fx • Fy) • ~x = y]');
  const r = compare(three, two);
  assert.equal(r.equivalent, false);
  // "At least three" versus "at least four" needs a model with three F's.
  const four = f('(∃x)(∃y)(∃z)(∃x1)[(Fx • Fy) • ((Fz • Fx1) • ([(~x = y • ~x = z) • (~x = x1 • ~y = z)] • (~y = x1 • ~z = x1)))]');
  const r2 = compare(three, four);
  assert.equal(r2.equivalent, false);
  assert.equal(r2.model.preds.F.size, 3);
});

test('relational: quantifier order matters', () => {
  const r = compare(f('(x)(∃y)Lxy'), f('(∃y)(x)Lxy'));
  assert.equal(r.equivalent, false);
  assert.ok(r.model.size <= 2);
});

test('validity in predicate logic', () => {
  assert.equal(validity([f('(x)(Fx ⊃ Gx)'), f('Fa')], f('Ga')).valid, true);
  assert.equal(validity([f('(x)(Fx ⊃ Gx)'), f('Fa')], f('Ga')).certainty, 'proved');
  // Boolean standpoint: "All S are P" does not entail "Some S are P".
  const sub = validity([f('(x)(Sx ⊃ Px)')], f('(∃x)(Sx • Px)'));
  assert.equal(sub.valid, false);
  assert.equal(sub.model.preds.S.size, 0);
  // De Morgan's horse's head is valid.
  const hh = validity([f('(x)(Hx ⊃ Ax)')], f('(x)[(∃y)(Hy • Txy) ⊃ (∃y)(Ay • Txy)]'));
  assert.equal(hh.valid, true);
});

test('the barber does not exist', () => {
  assert.equal(satisfiable([f('(∃y)(x)(Syx ≡ ~Sxx)')]).satisfiable, false);
});

test('evaluation and description', () => {
  const m = { size: 2, consts: { a: 0 }, preds: { F: new Set(['0']), R: new Set(['0,1']) }, letters: {} };
  assert.equal(evaluate(f('Fa'), m), true);
  assert.equal(evaluate(f('(∃x)Rax'), m), true);
  assert.equal(evaluate(f('(x)Fx'), m), false);
  const d = describeModel(m, { F: 'is a fox' });
  assert.match(d, /2 individuals/);
  assert.match(d, /“is a fox”/);
});
