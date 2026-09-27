// checkAnswer: the single place where exercises are marked. The UI renders
// what this returns; the content tests call the same function with each
// exercise's key and its listed wrong answers.

import * as A from './ast.js';
import { parseFormula, parseArgument, parseList } from './parser.js';
import { print } from './printer.js';
import {
  isSentential, equivalence, validity, classifyStatement, relations, consistency, truthTable, columns, evaluate,
} from './semantics.js';
import { checkProof } from './proof.js';
import * as FO from './models.js';

export const CLASSIFY_OPTIONS = {
  statement: ['tautologous', 'self-contradictory', 'contingent'],
  pair: ['equivalent', 'contradictory', 'consistent', 'inconsistent'],
  argument: ['valid', 'invalid'],
  set: ['consistent', 'inconsistent'],
};

const tv = (b) => (b ? 'true' : 'false');

export function argumentOf(ex) {
  const r = parseArgument(ex.argument, { closed: true, modal: ex.modal });
  if (!r.ok) throw new Error(`Exercise ${ex.id}: bad argument “${ex.argument}”: ${r.error.message}`);
  return r;
}

export function formulasOf(ex) {
  return ex.formulas.map((t) => {
    const r = parseFormula(t, { closed: true, modal: ex.modal });
    if (!r.ok) throw new Error(`Exercise ${ex.id}: bad formula “${t}”: ${r.error.message}`);
    return r.ast;
  });
}

function describeRow(v, dictionary) {
  return Object.keys(v).sort().map((k) => {
    const gloss = dictionary?.[k];
    return gloss ? `“${gloss}” (${k}) is ${tv(v[k])}` : `${k} is ${tv(v[k])}`;
  });
}

function joinWords(xs) {
  if (xs.length <= 1) return xs.join('');
  return `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`;
}

// ---------------------------------------------------------------------------

function checkTranslate(ex, input) {
  const dict = ex.dictionary ?? {};
  const letters = Object.keys(dict).filter((k) => /^[A-Z]$/.test(k));
  const parsed = parseFormula(input ?? '', { closed: true, letters: letters.length ? letters : undefined });
  if (!parsed.ok) return { ok: false, kind: 'parse', message: parsed.error.message, hint: parsed.error.hint, suggestions: parsed.error.suggestions };
  const ans = parsed.ast;
  const key = parseFormula(ex.key, { closed: true }).ast;
  if (isSentential(key) && isSentential(ans)) {
    const e = equivalence(ans, key);
    if (e.equivalent) {
      const same = A.equal(ans, key);
      return { ok: true, certainty: 'proved', message: same ? 'Correct.' : `Correct: your formula is equivalent to ${print(key)}.` };
    }
    const row = describeRow(e.row, dict);
    return {
      ok: false,
      kind: 'counterexample',
      row: e.row,
      message: `Suppose ${joinWords(row)}. Then your formula is ${tv(e.values[0])}, but the sentence is ${tv(e.values[1])}.`,
    };
  }
  const r = FO.compare(ans, key);
  if (r.equivalent === true) return { ok: true, certainty: r.certainty, message: r.certainty === 'proved' ? 'Correct.' : r.note };
  if (r.equivalent === false) {
    return {
      ok: false, kind: 'countermodel', model: r.model,
      message: `Here is a situation where they come apart. ${FO.describeModel(r.model, dict)} In it your formula is ${tv(r.values[0])}, but the sentence is ${tv(r.values[1])}.`,
    };
  }
  return { ok: true, certainty: 'provisional', message: r.note };
}

// Two readings of an ambiguous sentence: both must be given, in any order.
function checkReadings(ex, inputs) {
  const keys = ex.keys.map((k) => parseFormula(k, { closed: true }).ast);
  const got = [];
  for (const text of inputs) {
    const p = parseFormula(text ?? '', { closed: true });
    if (!p.ok) return { ok: false, kind: 'parse', message: p.error.message };
    got.push(p.ast);
  }
  const same = (a, b) => (isSentential(a) && isSentential(b) ? equivalence(a, b).equivalent : FO.compare(a, b).equivalent === true);
  const matched = keys.map((k) => got.findIndex((g) => same(g, k)));
  if (matched.every((i) => i >= 0) && new Set(matched).size === keys.length) return { ok: true, message: 'Both readings are right.' };
  const found = matched.filter((i) => i >= 0).length;
  return { ok: false, kind: 'readings', message: found ? `One reading is right; the other is not yet.` : 'Neither formula captures a reading of the sentence yet.' };
}

function targetColumns(ex, formulas) {
  if (ex.columns === 'all') return formulas.flatMap((f) => columns(f));
  return formulas;
}

function checkTruthTable(ex, input) {
  const formulas = formulasOf(ex);
  const cols = targetColumns(ex, formulas);
  const { rows, letters } = truthTable(cols);
  const expected = cols.map((_, c) => rows.map((r) => r.values[c]));
  let wrong = 0;
  let blank = 0;
  const cells = expected.map((col, c) => col.map((val, r) => {
    const got = input?.[c]?.[r];
    if (got !== 'T' && got !== 'F') { blank++; return null; }
    const ok = (got === 'T') === val;
    if (!ok) wrong++;
    return ok;
  }));
  if (blank) return { ok: false, kind: 'incomplete', cells, message: `Fill in every cell: ${blank} still empty.` };
  if (wrong) return { ok: false, kind: 'cells', cells, message: `${wrong} cell${wrong > 1 ? 's are' : ' is'} wrong. Work column by column, from the innermost operators out.` };
  return { ok: true, cells, letters, message: 'Every cell is right.' };
}

export function classifyAnswer(ex) {
  if (ex.mode === 'statement') return [classifyStatement(formulasOf(ex)[0])];
  if (ex.mode === 'pair') {
    const [a, b] = formulasOf(ex);
    return relations(a, b);
  }
  if (ex.mode === 'set') return [consistency(formulasOf(ex)).consistent ? 'consistent' : 'inconsistent'];
  if (ex.mode === 'argument') {
    const { premises, conclusion } = argumentOf(ex);
    return [validityOf(premises, conclusion).valid ? 'valid' : 'invalid'];
  }
  throw new Error(`Exercise ${ex.id}: unknown classify mode ${ex.mode}`);
}

function validityOf(premises, conclusion) {
  if ([...premises, conclusion].every(isSentential)) return validity(premises, conclusion);
  const r = FO.validity(premises, conclusion);
  return { valid: r.valid, model: r.model, certainty: r.certainty };
}

function classifyReason(ex, answer) {
  if (ex.mode === 'statement') {
    const [f] = formulasOf(ex);
    const { rows } = truthTable([f]);
    const t = rows.find((r) => r.values[0]);
    const fl = rows.find((r) => !r.values[0]);
    if (answer[0] === 'tautologous') return 'It is true on every row of its truth table.';
    if (answer[0] === 'self-contradictory') return 'It is false on every row of its truth table.';
    return `It is true on some rows (e.g. ${describeRow(t.v).join(', ')}) and false on others (e.g. ${describeRow(fl.v).join(', ')}).`;
  }
  if (ex.mode === 'argument') {
    const { premises, conclusion } = argumentOf(ex);
    const v = validityOf(premises, conclusion);
    if (v.valid) return 'No row makes every premise true and the conclusion false.';
    if (v.counterexamples) return `When ${describeRow(v.counterexamples[0], ex.dictionary).join(', ')}, every premise is true and the conclusion is false.`;
    return `A counterexample: ${FO.describeModel(v.model, ex.dictionary)}`;
  }
  if (ex.mode === 'set') {
    const c = consistency(formulasOf(ex));
    return c.consistent ? `All are true together when ${describeRow(c.row).join(', ')}.` : 'No row makes them all true together.';
  }
  const [a, b] = formulasOf(ex);
  const { rows } = truthTable([a, b]);
  const both = rows.find((r) => r.values[0] && r.values[1]);
  const parts = [];
  if (answer.includes('equivalent')) parts.push('they have the same truth value on every row');
  if (answer.includes('contradictory')) parts.push('they have opposite truth values on every row');
  parts.push(both ? `both are true when ${describeRow(both.v).join(', ')}` : 'no row makes both true');
  return `${parts.join('; ')}.`.replace(/^./, (c) => c.toUpperCase());
}

function checkClassify(ex, input) {
  const answer = classifyAnswer(ex);
  const chosen = [...new Set(input ?? [])];
  const ok = chosen.length === answer.length && answer.every((a) => chosen.includes(a));
  const reason = classifyReason(ex, answer);
  if (ok) return { ok: true, message: `Correct. ${reason}`, answer };
  let message;
  if (ex.mode === 'pair' && chosen.length && chosen.every((c) => answer.includes(c))) {
    message = `Right as far as it goes, but more than one relation holds here. ${reason}`;
  } else {
    message = `Not quite. ${reason}`;
  }
  return { ok: false, kind: 'classify', message, answer };
}

function checkMainOperator(ex, input) {
  const f = parseFormula(ex.formula).ast;
  const atomic = f.type === 'atom' || f.type === 'eq';
  if (input === undefined) return { ok: false, message: 'Click the operator you take to be the main one.' };
  if (atomic) {
    return input === null ? { ok: true, message: 'Right: an atomic formula has no main operator.' } : { ok: false, message: 'This formula is atomic: it has no operator at all.' };
  }
  if (Array.isArray(input) && input.length === 0) {
    return { ok: true, message: `Right. The main operator is the one whose scope is the whole formula.` };
  }
  if (input === null) return { ok: false, message: 'This formula is compound, so one of its operators is the main operator.' };
  const sub = A.at(f, input);
  return {
    ok: false,
    kind: 'scope',
    message: `That operator governs only ${print(sub)}, which is part of the formula. The main operator is the one whose scope is the whole formula.`,
  };
}

function checkChoice(ex, input) {
  const answer = Array.isArray(ex.answer) ? ex.answer : [ex.answer];
  const chosen = [...new Set(input ?? [])];
  const ok = chosen.length === answer.length && answer.every((a) => chosen.includes(a));
  const why = !ok && ex.why ? chosen.map((i) => ex.why[i]).filter(Boolean) : [];
  return { ok, message: ok ? (ex.explain ?? 'Correct.') : [...why, ex.retry ?? 'Not quite. Think it through again.'].join(' ') };
}

function checkCounterexample(ex, input) {
  const { premises, conclusion } = argumentOf(ex);
  const v = validity(premises, conclusion);
  if (input?.claimValid) {
    return v.valid
      ? { ok: true, message: 'Right: no assignment makes every premise true and the conclusion false, so the argument is valid.' }
      : { ok: false, message: 'There is an assignment that makes every premise true and the conclusion false. Keep looking.' };
  }
  const row = input?.valuation;
  if (!row) return { ok: false, message: 'Assign a truth value to every letter, or say the argument is valid.' };
  const letters = [...new Set([...premises, conclusion].flatMap((p) => A.letters(p)))];
  if (!letters.every((l) => typeof row[l] === 'boolean')) return { ok: false, message: 'Assign a truth value to every letter.' };
  const falsePremises = premises.map((p, i) => [p, i]).filter(([p]) => !evaluate(p, row));
  const concl = evaluate(conclusion, row);
  if (!falsePremises.length && !concl) return { ok: true, message: 'Every premise is true and the conclusion is false: a counterexample, so the argument is invalid.' };
  const probs = falsePremises.map(([p]) => `the premise ${print(p)} is false`);
  if (concl) probs.push(`the conclusion ${print(conclusion)} is true`);
  return { ok: false, message: `On this assignment ${joinWords(probs)}.${v.valid ? ' (In fact no assignment works.)' : ''}` };
}

function checkProofExercise(ex, input) {
  const { premises, conclusion } = argumentOf(ex);
  const result = checkProof({ premises, conclusion, lines: input ?? [] }, {
    allowedRules: ex.allowedRules, maxApps: ex.maxApps,
  });
  return {
    ok: result.complete,
    result,
    message: result.complete ? 'The proof is complete and every line checks.' : (result.problems[0] ?? 'Some lines need attention.'),
  };
}

// Supply the missing premise: it must make the argument valid, be
// consistent with the stated premises, and not simply be the conclusion.
function checkEnthymeme(ex, input) {
  const { premises, conclusion } = argumentOf(ex);
  const p = parseFormula(input ?? '', { closed: true });
  if (!p.ok) return { ok: false, kind: 'parse', message: p.error.message };
  const added = p.ast;
  const v = validity([...premises, added], conclusion);
  if (!v.valid) return { ok: false, message: `With that premise the argument is still invalid: when ${describeRow(v.counterexamples[0], ex.dictionary).join(', ')}, the premises are true and the conclusion false.` };
  if (!consistency([...premises, added]).consistent) return { ok: false, message: 'That premise contradicts the others, which makes the argument valid only trivially. Find a premise the arguer could actually hold.' };
  if (validity([added], conclusion).valid) return { ok: false, message: 'That premise already contains the conclusion by itself; the stated premise does no work. Find the bridge between the stated premise and the conclusion.' };
  return { ok: true, message: 'That premise makes the argument valid without doing all the work itself.' };
}

export function checkAnswer(ex, input) {
  switch (ex.type) {
    case 'translate': return checkTranslate(ex, input);
    case 'readings': return checkReadings(ex, input);
    case 'truth-table': return checkTruthTable(ex, input);
    case 'classify': return checkClassify(ex, input);
    case 'main-operator': return checkMainOperator(ex, input);
    case 'choice': return checkChoice(ex, input);
    case 'counterexample': return checkCounterexample(ex, input);
    case 'proof': return checkProofExercise(ex, input);
    case 'enthymeme': return checkEnthymeme(ex, input);
    default: {
      const handler = EXTRA_TYPES[ex.type];
      if (handler) return handler.check(ex, input);
      throw new Error(`Unknown exercise type ${ex.type}`);
    }
  }
}

// Later parts register further exercise types here (models, matrices, worlds).
export const EXTRA_TYPES = {};

/** The input that a correct student would give; used by tests and "show answer". */
export function modelAnswer(ex) {
  switch (ex.type) {
    case 'translate': return ex.key;
    case 'readings': return ex.keys;
    case 'truth-table': {
      const cols = targetColumns(ex, formulasOf(ex));
      const { rows } = truthTable(cols);
      return cols.map((_, c) => rows.map((r) => (r.values[c] ? 'T' : 'F')));
    }
    case 'classify': return classifyAnswer(ex);
    case 'main-operator': {
      const f = parseFormula(ex.formula).ast;
      return f.type === 'atom' || f.type === 'eq' ? null : [];
    }
    case 'choice': return Array.isArray(ex.answer) ? ex.answer : [ex.answer];
    case 'counterexample': {
      const { premises, conclusion } = argumentOf(ex);
      const v = validity(premises, conclusion);
      return v.valid ? { claimValid: true } : { valuation: v.counterexamples[0] };
    }
    case 'proof': return ex.solution.map(([text, just]) => ({ text, just }));
    case 'enthymeme': return ex.key;
    default: return EXTRA_TYPES[ex.type]?.answer(ex);
  }
}

export { parseList };
