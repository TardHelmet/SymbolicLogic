import { test } from 'node:test';
import assert from 'node:assert/strict';
import { f } from '../src/logic/parser.js';
import { checkProof, parseJustification, parseProofText, hints } from '../src/logic/proof.js';

const proof = (premises, conclusion, lines) => ({
  premises: premises.map((p) => f(p)),
  conclusion: f(conclusion),
  lines: lines.map(([text, just]) => ({ text, just })),
});

const errorsOf = (r) => r.lines.flatMap((l) => l.errors.map((e) => `${l.n}: ${e}`));

function assertComplete(p, opts) {
  const r = checkProof(p, opts);
  assert.ok(r.complete, `proof should be complete:\n${errorsOf(r).join('\n')}\n${r.problems.join('\n')}`);
  return r;
}

function assertLineError(p, n, pattern, opts) {
  const r = checkProof(p, opts);
  const line = r.lines[n - 1];
  assert.ok(!line.ok, `line ${n} should be rejected`);
  assert.match(line.errors.join(' '), pattern);
  return r;
}

test('justification parsing', () => {
  assert.deepEqual(parseJustification('1, 2, MP').rule, 'MP');
  assert.deepEqual(parseJustification('MP 1 2').refs.map((r) => r.from), [1, 2]);
  const cp = parseJustification('3–5, CP');
  assert.equal(cp.rule, 'CP');
  assert.deepEqual([cp.refs[0].from, cp.refs[0].to], [3, 5]);
  assert.equal(parseJustification('ACP').rule, 'ACP');
  assert.match(parseJustification('1, 2').error, /Name the rule/);
  assert.match(parseJustification('1 MPP').error, /MP/);
});

test('a simple proof with MP and HS', () => {
  assertComplete(proof(['A ⊃ B', 'B ⊃ C', 'A'], 'C', [
    ['A ⊃ C', '1, 2, HS'],
    ['C', '4, 3, MP'],
  ]));
});

test('explosion: from A • ~A, anything', () => {
  assertComplete(proof(['A • ~A'], 'B', [
    ['A', '1, Simp'],
    ['~A • A', '1, Com'],
    ['~A', '3, Simp'],
    ['A ∨ B', '2, Add'],
    ['B', '5, 4, DS'],
  ]));
});

test('conditional proof', () => {
  assertComplete(proof(['A ⊃ B', 'B ⊃ C'], 'A ⊃ C', [
    ['A', 'ACP'],
    ['B', '1, 3, MP'],
    ['C', '2, 4, MP'],
    ['A ⊃ C', '3–5, CP'],
  ]));
});

test('indirect proof with DN at the end', () => {
  assertComplete(proof(['A ∨ B', '~B'], 'A', [
    ['~A', 'AIP'],
    ['B', '1, 3, DS'],
    ['B • ~B', '4, 2, Conj'],
    ['~~A', '3–5, IP'],
    ['A', '6, DN'],
  ]));
});

test('proving a logical truth from no premises', () => {
  assertComplete(proof([], 'A ⊃ (B ⊃ A)', [
    ['A', 'ACP'],
    ['B', 'ACP'],
    ['A ∨ A', '1, Taut'],
    ['A', '3, Taut'],
    ['B ⊃ A', '2–4, CP'],
    ['A ⊃ (B ⊃ A)', '1–5, CP'],
  ]));
});

test('closed sequences cannot be cited', () => {
  assertLineError(proof(['A ⊃ B'], 'B', [
    ['A', 'ACP'],
    ['B', '1, 2, MP'],
    ['A ⊃ B', '2–3, CP'],
    ['B', '1, 2, MP'],
  ]), 5, /closed/);
});

test('CP must cite the whole sequence and have the right shape', () => {
  assertLineError(proof(['A ⊃ B'], 'A ⊃ B', [
    ['A', 'ACP'],
    ['B', '1, 2, MP'],
    ['A ⊃ B', '3, CP'],
  ]), 4, /lines 2–3/);
  assertLineError(proof(['A ⊃ B'], 'B ⊃ A', [
    ['A', 'ACP'],
    ['B', '1, 2, MP'],
    ['B ⊃ A', '2–3, CP'],
  ]), 4, /A ⊃ B/);
});

test('IP requires a contradiction and yields the negated assumption', () => {
  assertLineError(proof(['A ⊃ B', '~B'], '~A', [
    ['A', 'AIP'],
    ['B', '1, 3, MP'],
    ['~A', '3–4, IP'],
  ]), 5, /contradiction/);
  assertLineError(proof(['A'], '~~A', [
    ['~A', 'AIP'],
    ['A • ~A', '1, 2, Conj'],
    ['A', '2–3, IP'],
  ]), 4, /~~A/);
});

test('an open assumption keeps the proof incomplete', () => {
  const r = checkProof(proof(['A'], 'A', [['B', 'ACP']]));
  assert.ok(!r.complete);
  assert.match(r.problems.join(' '), /still open/);
});

test('fallacies and wrong rules are named on the line', () => {
  assertLineError(proof(['A ⊃ B', 'B'], 'A', [['A', '1, 2, MP']]), 3, /affirming the consequent/);
  assertLineError(proof(['A • B'], 'B', [['B', '1, Simp']]), 2, /Com/);
  assertLineError(proof(['A ∨ B', '~A'], 'B', [['B', '1, 2, MP']]), 3, /DS/);
  assertLineError(proof(['A'], 'B', [['B', '3, Add']]), 2, /earlier lines/);
});

test('lines resting on a faulty line are flagged', () => {
  const r = checkProof(proof(['A ⊃ B', 'B', 'A ⊃ C'], 'C', [
    ['A', '1, 2, MP'],
    ['C', '3, 4, MP'],
  ]));
  assert.ok(!r.lines[3].ok);
  assert.ok(r.lines[4].ok);
  assert.equal(r.lines[4].dependsOn, 4);
  assert.ok(!r.complete);
});

test('allowed rules', () => {
  assertLineError(proof(['A • B'], 'B', [
    ['B • A', '1, Com'],
    ['B', '2, Simp'],
  ]), 2, /not available/, { allowedRules: ['MP', 'MT', 'Simp'] });
});

test('one application per line, as Copi requires, unless an exercise allows more', () => {
  const p = proof(['A ⊃ B'], '~~A ⊃ ~~B', [['~~A ⊃ ~~B', '1, DN']]);
  assertLineError(p, 2, /once per line/);
  assertComplete(p, { maxApps: Infinity });
  assertComplete(proof(['A ⊃ B'], '~~A ⊃ ~~B', [['~~A ⊃ B', '1, DN'], ['~~A ⊃ ~~B', '2, D.N.']]));
});

test('Absorption', () => {
  assertComplete(proof(['A ⊃ B'], 'A ⊃ (A • B)', [['A ⊃ (A • B)', '1, Abs.']]));
  assertLineError(proof(['A ⊃ B'], 'A ⊃ (B • A)', [['A ⊃ (B • A)', '1, Abs']]), 2, /antecedent first/);
});

test('Copi’s labels and assumption annotations are read', () => {
  assertComplete(proof(['A ⊃ B', 'B ⊃ C'], 'A ⊃ C', [
    ['A', 'Assumption (C.P.)'],
    ['B', '1, 3, M.P.'],
    ['C', '2, 4, M.P.'],
    ['A ⊃ C', '3–5, C.P.'],
  ]));
  assertComplete(proof(['A ⊃ B', 'B ⊃ C'], 'A ⊃ C', [
    ['A', '(C.P.)'],
    ['B', '1, 3, MP'],
    ['C', '2, 4, MP'],
    ['A ⊃ C', '3-5, CP'],
  ]));
});

test('Copi’s indirect proof ends at the explicit contradiction', () => {
  const p = proof(['A ∨ B', 'A ⊃ C', 'B ⊃ C'], 'C', [
    ['~C', 'Assumption (I.P.)'],
    ['~A', '2, 4, M.T.'],
    ['B', '1, 5, D.S.'],
    ['C', '3, 6, M.P.'],
    ['C • ~C', '7, 4, Conj.'],
  ]);
  const r = checkProof(p);
  assert.ok(r.complete && r.byContradiction, r.problems.join(' '));
  // Hurley's ending, discharging the sequence, is also accepted.
  assertComplete(proof(['A ∨ B', 'A ⊃ C', 'B ⊃ C'], 'C', [
    ['~C', 'AIP'], ['~A', '2, 4, MT'], ['B', '1, 5, DS'], ['C', '3, 6, MP'], ['C • ~C', '7, 4, Conj'],
    ['~~C', '4–8, IP'], ['C', '9, DN'],
  ]));
  // A contradiction under an assumption that does not deny the conclusion proves nothing.
  const q = checkProof(proof(['A ⊃ B'], 'B', [['A', 'AIP'], ['B', '1, 2, MP'], ['~B', '1, 2, MP']]));
  assert.ok(!q.complete);
});

// --- Quantifiers ---------------------------------------------------------

test('a categorical syllogism', () => {
  assertComplete(proof(['(x)(Fx ⊃ Gx)', '(x)(Gx ⊃ Hx)'], '(x)(Fx ⊃ Hx)', [
    ['Fy ⊃ Gy', '1, UI'],
    ['Gy ⊃ Hy', '2, UI'],
    ['Fy ⊃ Hy', '3, 4, HS'],
    ['(x)(Fx ⊃ Hx)', '5, UG'],
  ]));
});

test('EI and EG', () => {
  assertComplete(proof(['(x)(Fx ⊃ Gx)', '(∃x)Fx'], '(∃x)Gx', [
    ['Fa', '2, EI'],
    ['Fa ⊃ Ga', '1, UI'],
    ['Ga', '4, 3, MP'],
    ['(∃x)Gx', '5, EG'],
  ]));
});

test('EI must use a new name', () => {
  assertLineError(proof(['(∃x)Fx', '(∃x)Gx'], '(∃x)(Fx • Gx)', [
    ['Fa', '1, EI'],
    ['Ga', '2, EI'],
  ]), 4, /new to the proof/);
  assertLineError(proof(['(∃x)Fx'], 'Fa', [['Fa', '1, EI']]), 2, /conclusion/);
  assertLineError(proof(['(∃x)Fx'], '(∃x)Fx', [['Fy', '1, EI']]), 2, /constant/);
});

test('UG never generalizes on a constant', () => {
  assertLineError(proof(['Fa'], '(x)Fx', [['(x)Fx', '1, UG']]), 2, /never on a constant/);
});

test('the quantifier-shift fallacy is blocked', () => {
  assertLineError(proof(['(x)(∃y)Lxy'], '(∃y)(x)Lxy', [
    ['(∃y)Lxy', '1, UI'],
    ['Lxa', '2, EI'],
    ['(x)Lxa', '3, UG'],
  ]), 4, /obtained by EI/);
});

test('the CP escape is blocked', () => {
  assertLineError(proof([], '(∃z)(x)[(∃y)Lxy ⊃ Lxz]', [
    ['(∃y)Lxy', 'ACP'],
    ['Lxa', '1, EI'],
    ['(∃y)Lxy ⊃ Lxa', '1–2, CP'],
    ['(x)[(∃y)Lxy ⊃ Lxa]', '3, UG'],
  ]), 4, /obtained by EI/);
});

test('UG inside a sequence whose assumption has the variable free', () => {
  assertLineError(proof(['(x)(Fx ⊃ Gx)'], '(x)Fx ⊃ (x)Gx', [
    ['Fx', 'ACP'],
    ['(x)Fx', '2, UG'],
  ]), 3, /indented sequence/);
});

test('UI capture is blocked', () => {
  assertLineError(proof(['(x)(∃y)Lxy'], '(∃y)Lyy', [['(∃y)Lyy', '1, UI']]), 2, /capture/);
});

test('UI must replace consistently', () => {
  assertLineError(proof(['(x)(Fx ⊃ Gx)'], 'Fa ⊃ Gb', [['Fa ⊃ Gb', '1, UI']]), 2, /one and the same/);
});

test('CQ then UI', () => {
  assertComplete(proof(['~(∃x)Fx'], '~Fa', [
    ['(x)~Fx', '1, CQ'],
    ['~Fa', '2, UI'],
  ]));
});

test('UI on a negated quantifier points to CQ', () => {
  assertLineError(proof(['~(x)Fx'], '~Fa', [['~Fa', '1, UI']]), 2, /CQ/);
});

test('CP with quantifiers: UG after the sequence closes', () => {
  assertComplete(proof(['(x)(Fx ⊃ Gx)'], '(x)Fx ⊃ (x)Gx', [
    ['(x)Fx', 'ACP'],
    ['Fy', '2, UI'],
    ['Fy ⊃ Gy', '1, UI'],
    ['Gy', '4, 3, MP'],
    ['(x)Gx', '5, UG'],
    ['(x)Fx ⊃ (x)Gx', '2–6, CP'],
  ]));
});

// --- Identity --------------------------------------------------------------

test('identity: substitution, symmetry, reflexivity', () => {
  assertComplete(proof(['Fa', 'a = b'], 'Fb', [['Fb', '1, 2, Id']]));
  assertComplete(proof(['Fb', 'a = b'], 'Fa', [
    ['b = a', '2, Id'],
    ['Fa', '1, 3, Id'],
  ]));
  assertComplete(proof([], 'a = a', [['a = a', 'Id']]));
  // Copi substitutes in either direction.
  assertComplete(proof(['Fb', 'a = b'], 'Fa', [['Fa', '1, 2, Id']]));
  assertComplete(proof(['Wgf', 'g = m'], 'Wmf', [['Wmf', '1, 2, Id.']]));
});

test('identity: what differs in a property is not identical', () => {
  assertComplete(proof(['Fa', '~Fb'], '~(a = b)', [['~(a = b)', '1, 2, Id']]));
  assertComplete(proof(['~Fb', 'Fa'], '~(b = a)', [['~(b = a)', '1, 2, Id']]));
  assertLineError(proof(['Fa', '~Gb'], '~(a = b)', [['~(a = b)', '1, 2, Id']]), 3, /negation of the same line/);
});

test('identity: substitution may replace some occurrences', () => {
  assertComplete(proof(['Raa', 'a = b'], 'Rab', [['Rab', '1, 2, Id']]));
});

// --- Text format and hints ------------------------------------------------

test('parsing proofs written as text', () => {
  const p = parseProofText(`
1. A ⊃ B
2. A          / B
3. B          1, 2, MP
`);
  assert.ok(!p.error, p.error);
  assert.equal(p.premises.length, 2);
  assert.ok(checkProof(p).complete);
});

test('hints are goal-directed', () => {
  const h = hints(proof(['A ⊃ B', 'B ⊃ C'], 'A ⊃ C', []));
  assert.match(h.join(' '), /conditional proof/);
  const h2 = hints(proof(['A ⊃ B', 'A'], 'B', []));
  assert.match(h2.join(' '), /fit MP/);
});

test('undefined options keep their defaults', () => {
  const p = proof(['~(A • B)'], '~A ∨ ~B', [['~A ∨ ~B', '1, DM']]);
  assertComplete(p, { maxApps: undefined, allowedRules: undefined });
});
