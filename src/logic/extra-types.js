// Checkers for exercise types beyond the sentential core. They register on
// EXTRA_TYPES in check.js; the UI and the content tests both import this file.

import { EXTRA_TYPES, argumentOf, formulasOf } from './check.js';
import * as FO from './models.js';
import { print } from './printer.js';

function goalOf(ex) {
  if (ex.argument) {
    const { premises, conclusion } = argumentOf(ex);
    return { premises, conclusion, formulas: [] };
  }
  return { premises: [], conclusion: null, formulas: formulasOf(ex) };
}

function normalizeModel(m) {
  return {
    size: m.size,
    consts: { ...m.consts },
    letters: { ...(m.letters ?? {}) },
    preds: Object.fromEntries(Object.entries(m.preds ?? {}).map(([p, ext]) => [p, new Set(ext)])),
  };
}

// Countermodels: build a small world in which premises are true and the
// conclusion false (or in which given formulas are all true).
EXTRA_TYPES.countermodel = {
  check(ex, input) {
    if (!input || !input.size) return { ok: false, message: 'Choose how many individuals the world has.' };
    const goal = goalOf(ex);
    const sig = FO.signature([...goal.premises, ...(goal.conclusion ? [goal.conclusion] : []), ...goal.formulas]);
    for (const c of sig.consts) {
      if (!(c in (input.consts ?? {}))) return { ok: false, message: `Say which individual ${c} names.` };
    }
    const r = FO.checkModel(normalizeModel(input), goal);
    if (r.ok) {
      return {
        ok: true,
        message: ex.argument
          ? 'In this world every premise is true and the conclusion is false, so the argument is invalid.'
          : 'In this world every formula is true.',
        results: r.results,
      };
    }
    const bad = r.results.filter((x) => x.value !== x.want).map((x) =>
      `${x.role === 'conclusion' ? 'the conclusion' : x.role === 'premise' ? 'the premise' : ''} ${print(x.f)} is ${x.value ? 'true' : 'false'}`.trim());
    return { ok: false, message: `Not yet: in this world ${bad.join('; ')}.`, results: r.results };
  },
  answer(ex) {
    const goal = goalOf(ex);
    const m = goal.conclusion ? FO.validity(goal.premises, goal.conclusion).model : FO.satisfiable(goal.formulas).model;
    if (!m) throw new Error(`Exercise ${ex.id}: no model exists`);
    return { size: m.size, consts: m.consts, letters: m.letters, preds: Object.fromEntries(Object.entries(m.preds).map(([p, s]) => [p, [...s]])) };
  },
};

// Flag the step: a finished-looking proof with exactly one faulty line; the
// student finds it. The faulty line is whatever the checker rejects, so the
// answer key cannot drift from the rules.
import { checkProof } from './proof.js';

export function flaggedLine(ex) {
  const { premises, conclusion } = argumentOf(ex);
  const res = checkProof({ premises, conclusion, lines: ex.lines.map(([text, just]) => ({ text, just })) });
  const bad = res.lines.filter((l) => !l.ok);
  return { bad, res };
}

EXTRA_TYPES['flag-step'] = {
  check(ex, input) {
    const { bad } = flaggedLine(ex);
    if (input == null) return { ok: false, message: 'Click the line that breaks a rule.' };
    const hit = bad.find((l) => l.n === input);
    if (hit) return { ok: true, message: `Right: line ${input}. ${hit.errors.join(' ')}` };
    return { ok: false, message: `Line ${input} is licensed by its rule. Look for a step whose rule has a restriction.` };
  },
  answer(ex) {
    return flaggedLine(ex).bad[0]?.n ?? null;
  },
};
