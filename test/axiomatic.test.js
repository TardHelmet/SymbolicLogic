import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as AX from '../src/logic/axiomatic.js';
import { parsePolish, printPolish } from '../src/logic/polish.js';
import { parseFormula } from '../src/logic/parser.js';
import * as A from '../src/logic/ast.js';

const S = (t) => parseFormula(t, { schema: true }).ast;
const run = (system, goal, lines, theorems) => AX.checkAxiomatic({ goal: S(goal), lines: lines.map(([text, just]) => ({ text, just })) }, { system, theorems });
const complete = (...args) => {
  const r = run(...args);
  assert.ok(r.complete, `${args[1]}: ${r.problems.join(' ')} ${r.lines.map((l) => l.errors.join(' ')).join(' | ')}`);
};
const lineError = (system, goal, lines, n, pattern) => {
  const r = run(system, goal, lines);
  assert.match(r.lines[n - 1].errors.join(' '), pattern);
};

test('every axiom of every system is a tautology', async () => {
  const { validity } = await import('../src/logic/semantics.js');
  for (const sys of Object.values(AX.SYSTEMS)) {
    for (const [k, ax] of Object.entries(sys.axioms)) assert.ok(validity([], ax.ast).valid, `${sys.name} ${k}`);
  }
});

test('Langer’s derivations of *2.02, *2.03 and *2.05 (ch. XII)', () => {
  complete('PM', 'q ⊃ (p ⊃ q)', [['q ⊃ (p ∨ q)', '*1.3'], ['q ⊃ (~p ∨ q)', 'Sub 1'], ['q ⊃ (p ⊃ q)', 'Df 2']]);
  complete('PM', '(p ⊃ ~q) ⊃ (q ⊃ ~p)', [['(p ∨ q) ⊃ (q ∨ p)', '*1.4'], ['(~p ∨ ~q) ⊃ (~q ∨ ~p)', 'Sub 1'], ['(p ⊃ ~q) ⊃ (~q ∨ ~p)', 'Df 2'], ['(p ⊃ ~q) ⊃ (q ⊃ ~p)', 'Df 3']]);
  complete('PM', '(q ⊃ r) ⊃ [(p ⊃ q) ⊃ (p ⊃ r)]', [['(q ⊃ r) ⊃ [(p ∨ q) ⊃ (p ∨ r)]', '*1.6'], ['(q ⊃ r) ⊃ [(~p ∨ q) ⊃ (~p ∨ r)]', 'Sub 1'], ['(q ⊃ r) ⊃ [(p ⊃ q) ⊃ (p ⊃ r)]', 'Df 2']]);
});

test('Principia’s proof of *2.08, p ⊃ p, by two detachments', () => {
  complete('PM', 'p ⊃ p', [
    ['[(p ∨ p) ⊃ p] ⊃ {[p ⊃ (p ∨ p)] ⊃ (p ⊃ p)}', '*2.05'],
    ['(p ∨ p) ⊃ p', '*1.2'],
    ['[p ⊃ (p ∨ p)] ⊃ (p ⊃ p)', '*1.1 1, 2'],
    ['p ⊃ (p ∨ p)', '*1.3'],
    ['p ⊃ p', 'MP 3, 4'],
  ], { '*2.05': '(q ⊃ r) ⊃ [(p ⊃ q) ⊃ (p ⊃ r)]' });
});

test('Copi’s first theorem of R.S.', () => {
  complete('RS', '~(~P • P)', [
    ['P ⊃ (P • P)', 'Ax. 1'],
    ['(P • P) ⊃ P', 'Ax. 2'],
    ['[P ⊃ (P • P)] ⊃ [~((P • P) • ~P) ⊃ ~(~P • P)]', 'Ax. 3'],
    ['~((P • P) • ~P) ⊃ ~(~P • P)', 'R1 1, 3'],
    ['~((P • P) • ~P)', 'Df 2'],
    ['~(~P • P)', 'R1 5, 4'],
  ]);
});

test('diagnoses: not an instance, missing Df, non-tautology, bad detachment, unavailable axiom', () => {
  lineError('PM', 'p ⊃ p', [['p ⊃ (p ∨ p)', '*1.2']], 1, /not an instance of \*1\.2/);
  lineError('PM', 'q ⊃ (p ⊃ q)', [['q ⊃ (p ⊃ q)', '*1.3']], 1, /add a Df line/);
  lineError('PM', 'p ⊃ q', [['p ⊃ q', '*1.3']], 1, /not a tautology/);
  lineError('PM', 'p ⊃ p', [['(p ∨ p) ⊃ p', '*1.2'], ['p ⊃ (p ∨ p)', '*1.3'], ['p ⊃ p', 'MP 1, 2']], 3, /modus ponens needs its antecedent/);
  lineError('HA', 'p', [['[p ∨ (q ∨ r)] ⊃ [q ∨ (p ∨ r)]', '*1.5']], 1, /not an axiom of Hilbert and Ackermann/);
  // Substitution must be uniform.
  lineError('PM', 'q ⊃ (p ∨ q)', [['q ⊃ (p ∨ q)', '*1.3'], ['(q ∨ q) ⊃ (p ∨ q)', 'Sub 1']], 2, /not a substitution instance/);
});

test('independence by matrices: Perm in Principia, Axiom 3 in R.S.', () => {
  const perm = { values: [0, 1, 2], designated: [0], not: [1, 2, 0], or: [[0, 0, 0], [0, 1, 2], [0, 0, 2]] };
  assert.deepEqual(AX.shownIndependent(perm, 'PM'), ['*1.4']);
  const ax3 = { values: [0, 1, 2], designated: [0], not: [1, 0, 0], and: [[0, 1, 0], [1, 1, 1], [1, 1, 1]] };
  assert.deepEqual(AX.shownIndependent(ax3, 'RS'), ['Ax. 3']);
  // The two-valued matrix makes every axiom designated and shows nothing.
  const two = { values: [0, 1], designated: [0], not: [1, 0], or: [[0, 0], [0, 1]] };
  assert.deepEqual(AX.shownIndependent(two, 'PM'), []);
});

test('Polish notation: printing and reading, no brackets needed', () => {
  const cases = [['(P • Q) ⊃ R', 'CKpqr'], ['P • (Q ⊃ R)', 'KpCqr'], ['(P ⊃ Q) ⊃ [(Q ⊃ R) ⊃ (P ⊃ R)]', 'CCpqCCqrCpr'], ['~(P ∨ ~Q) ≡ R', 'ENApNqr']];
  for (const [copi, pol] of cases) {
    const f = parseFormula(copi).ast;
    assert.equal(printPolish(f), pol);
    const back = parsePolish(pol);
    assert.ok(back.ok && A.equal(back.ast, f), pol);
  }
  assert.ok(!parsePolish('CKpq').ok);
  assert.ok(!parsePolish('Kpqr').ok);
  assert.ok(!parsePolish('Kp(q)').ok);
});
