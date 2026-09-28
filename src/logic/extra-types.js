// Checkers for exercise types beyond the sentential core. They register on
// EXTRA_TYPES in check.js; the UI and the content tests both import this file.

import { EXTRA_TYPES, argumentOf, formulasOf } from './check.js';
import * as FO from './models.js';
import { print } from './printer.js';
import { parseArgument, parseFormula } from './parser.js';
import { checkProof } from './proof.js';
import * as MV from './manyvalued.js';
import * as K from './kripke.js';
import { isSentential, consistency, showRow } from './semantics.js';
import * as AL from './algebra.js';

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

// --- Non-classical -----------------------------------------------------------------

const modalArg = (ex) => {
  const r = parseArgument(ex.argument, { closed: true, modal: true });
  if (!r.ok) throw new Error(`Exercise ${ex.id}: ${r.error.message}`);
  return r;
};
const modalFormula = (ex, text) => {
  const r = parseFormula(text, { closed: true, modal: true });
  if (!r.ok) throw new Error(`Exercise ${ex.id}: ${r.error.message}`);
  return r.ast;
};

// Intuitionistic flag-the-step: every line is classically fine; the one to
// find is the line an intuitionist rejects, i.e. the one that does not follow
// from its cited lines in intuitionistic Kripke semantics.
const baseFlagged = flaggedLine;
export function flaggedLineFor(ex) {
  if (ex.logic !== 'intuitionistic') return baseFlagged(ex);
  const { res } = baseFlagged(ex);
  const bad = [];
  for (const l of res.lines) {
    if (l.rule === 'Premise' || ['ACP', 'AIP', 'CP', 'IP'].includes(l.rule) || !l.formula) continue;
    const cited = l.refs.flatMap((r) => (r.single ? [res.lines[r.from - 1].formula] : []));
    const c = K.countermodel('INT', cited, l.formula);
    if (c) bad.push({ ...l, errors: [`From ${cited.map((x) => print(x)).join(', ')} an intuitionist cannot get ${print(l.formula)}. Countermodel: ${K.describe(c.model, 'INT')} At world ${c.world} the cited line holds and this one does not.`] });
  }
  return { bad, res };
}
EXTRA_TYPES['flag-step'].check = function check(ex, input) {
  const { bad } = flaggedLineFor(ex);
  if (input == null) return { ok: false, message: 'Click the line that breaks a rule.' };
  const hit = bad.find((l) => l.n === input);
  if (hit) return { ok: true, message: `Right: line ${input}. ${hit.errors.join(' ')}` };
  return {
    ok: false,
    message: ex.logic === 'intuitionistic'
      ? `Line ${input} is acceptable to an intuitionist too. Look for a step that removes a double negation or turns a conditional into a disjunction.`
      : `Line ${input} is licensed by its rule. Look for a step whose rule has a restriction.`,
  };
};
EXTRA_TYPES['flag-step'].answer = (ex) => flaggedLineFor(ex).bad[0]?.n ?? null;

// Three-valued matrices.
EXTRA_TYPES.matrix = {
  check(ex, input) {
    const logic = ex.logic;
    const L = MV.LOGICS[logic];
    if (ex.question === 'table') {
      const fs = ex.formulas.map((t) => modalFormula(ex, t));
      const { rows } = MV.table(logic, fs);
      let wrong = 0;
      let blank = 0;
      const cells = fs.map((_, c) => rows.map((r, i) => {
        const got = input?.[c]?.[i];
        if (got == null) { blank++; return null; }
        const ok = got === r.values[c];
        if (!ok) wrong++;
        return ok;
      }));
      if (blank) return { ok: false, cells, message: `Fill in every cell: ${blank} still empty.` };
      if (wrong) return { ok: false, cells, message: `${wrong} cell${wrong > 1 ? 's are' : ' is'} wrong. In ${L.name}, ${L.third} means “${L.gloss}”.` };
      return { ok: true, cells, message: 'Every cell is right.' };
    }
    const { premises, conclusion } = modalArg(ex);
    const v = MV.validity(logic, premises, conclusion);
    if (ex.question === 'validity') {
      const answer = v.valid ? 'valid' : 'invalid';
      const why = v.valid
        ? `No assignment makes every premise designated and the conclusion undesignated in ${L.name}.`
        : `In ${L.name}, when ${MV.showValuation(logic, v.counterexample)}, every premise is designated (${L.designated.map((x) => MV.label(logic, x)).join(' or ')}) and the conclusion is not.`;
      const ok = input?.length === 1 && input[0] === answer;
      return { ok, answer: [answer], message: `${ok ? 'Correct.' : 'Not quite.'} ${why}` };
    }
    // question: counterexample
    if (input?.claimValid) {
      return v.valid ? { ok: true, message: `Right: the argument is valid in ${L.name}.` } : { ok: false, message: 'There is a counterexample. Keep looking.' };
    }
    const row = input?.valuation ?? {};
    const ls = MV.lettersOf([...premises, conclusion]);
    if (!ls.every((l) => MV.VALUES.includes(row[l]))) return { ok: false, message: 'Give every letter a value.' };
    const bad = premises.filter((p) => !MV.designated(logic, MV.evaluate(logic, p, row))).map((p) => `the premise ${print(p)} is not designated`);
    if (MV.designated(logic, MV.evaluate(logic, conclusion, row))) bad.push(`the conclusion ${print(conclusion)} is designated`);
    return bad.length ? { ok: false, message: `On this assignment ${bad.join(' and ')}.` } : { ok: true, message: `A counterexample in ${L.name}: every premise is designated and the conclusion is not.` };
  },
  answer(ex) {
    if (ex.question === 'table') {
      const fs = ex.formulas.map((t) => modalFormula(ex, t));
      const { rows } = MV.table(ex.logic, fs);
      return fs.map((_, c) => rows.map((r) => r.values[c]));
    }
    const { premises, conclusion } = modalArg(ex);
    const v = MV.validity(ex.logic, premises, conclusion);
    if (ex.question === 'validity') return [v.valid ? 'valid' : 'invalid'];
    return v.valid ? { claimValid: true } : { valuation: v.counterexample };
  },
};

// Kripke models.
EXTRA_TYPES.kripke = {
  check(ex, input) {
    const logic = ex.logic ?? 'K';
    const fname = K.FRAMES[logic].name;
    if (ex.question === 'evaluate') {
      const m = K.fromData(ex.model);
      const f = modalFormula(ex, ex.formula);
      const answer = K.truthAt(logic, f, m, String(ex.world)) ? 'true' : 'false';
      const ok = input?.length === 1 && input[0] === answer;
      return { ok, answer: [answer], message: `${ok ? 'Correct' : 'Not quite'}: ${print(f)} is ${answer} at world ${ex.world}.` };
    }
    const { premises, conclusion } = modalArg(ex);
    if (ex.question === 'validity') {
      const v = K.validity(logic, premises, conclusion);
      const answer = v.valid ? 'valid' : 'invalid';
      const ok = input?.length === 1 && input[0] === answer;
      const why = v.valid ? `No ${fname} model with up to three worlds has a counterexample.` : `A ${fname} countermodel: ${K.describe(v.model, logic)} At world ${v.world} the premises are true and the conclusion false.`;
      return { ok, answer: [answer], message: `${ok ? 'Correct.' : 'Not quite.'} ${why}` };
    }
    // question: countermodel
    if (!input?.worlds?.length) return { ok: false, message: 'Add at least one world.' };
    const m = K.fromData(input);
    const problems = K.frameProblems(logic, m);
    if (problems.length) {
      const words = { reflexive: 'every world must see itself', symmetric: 'if one world sees another, the other must see it back', transitive: 'if 1 sees 2 and 2 sees 3, then 1 must see 3', persistent: 'a letter true at a world must stay true at every world it sees' };
      return { ok: false, message: `This is not a ${fname} model: ${problems.map((p) => words[p]).join('; ')}.` };
    }
    const w = String(input.world ?? m.worlds[0]);
    const results = [
      ...premises.map((p) => ({ f: p, role: 'premise', value: K.truthAt(logic, p, m, w), want: true })),
      { f: conclusion, role: 'conclusion', value: K.truthAt(logic, conclusion, m, w), want: false },
    ];
    const bad = results.filter((r) => r.value !== r.want);
    if (!bad.length) {
      const what = premises.length ? 'every premise is true and the conclusion false' : `${print(conclusion)} is false`;
      return { ok: true, results, message: `At world ${w} ${what}: a ${fname} countermodel.` };
    }
    return { ok: false, results, message: `Not yet: at world ${w}, ${bad.map((r) => `${r.role === 'conclusion' ? 'the conclusion' : 'the premise'} ${print(r.f)} is ${r.value ? 'true' : 'false'}`).join('; ')}.` };
  },
  answer(ex) {
    const logic = ex.logic ?? 'K';
    if (ex.question === 'evaluate') {
      const m = K.fromData(ex.model);
      return [K.truthAt(logic, modalFormula(ex, ex.formula), m, String(ex.world)) ? 'true' : 'false'];
    }
    const { premises, conclusion } = modalArg(ex);
    const v = K.validity(logic, premises, conclusion);
    if (ex.question === 'validity') return [v.valid ? 'valid' : 'invalid'];
    if (v.valid) throw new Error(`Exercise ${ex.id}: no countermodel exists`);
    return { ...K.toData(v.model), world: v.world };
  },
};

// Which premise to deny: an inconsistent set; any premise whose removal
// leaves the rest consistent is a coherent way out.
function denySet(ex) {
  return ex.premises.map((t) => {
    const r = parseFormula(t, { closed: true });
    if (!r.ok) throw new Error(`Exercise ${ex.id}: ${r.error.message}`);
    return r.ast;
  });
}
export function consistentSet(fs) {
  if (fs.every(isSentential)) {
    const c = consistency(fs);
    return { consistent: c.consistent, witness: c.consistent ? showRow(c.row) : null };
  }
  const s = FO.satisfiable(fs);
  return { consistent: s.satisfiable, witness: s.satisfiable ? FO.describeModel(s.model) : null };
}
EXTRA_TYPES.deny = {
  check(ex, input) {
    if (input == null) return { ok: false, message: 'Choose the claim you would give up.' };
    const fs = denySet(ex);
    const rest = fs.filter((_, i) => i !== input);
    const c = consistentSet(rest);
    if (!c.consistent) return { ok: false, message: 'Even without that claim, the others still cannot all be true. Giving it up does not resolve the paradox.' };
    return { ok: true, message: `${ex.notes?.[input] ?? ''} Without it, the remaining claims can all be true together (for instance: ${c.witness}).`.trim() };
  },
  answer(ex) {
    const fs = denySet(ex);
    return fs.findIndex((_, i) => consistentSet(fs.filter((__, j) => j !== i)).consistent);
  },
};

// --- Form and system (Langer) ------------------------------------------------------

// A derivation of an equation from Huntington's postulates and Langer's theorems.
EXTRA_TYPES.equational = {
  check(ex, input) {
    const goal = AL.parseEquation(ex.goal).eq;
    const result = AL.checkDerivation({ goal, lines: input ?? [] }, { laws: ex.laws ?? AL.POSTULATES, maxApps: ex.maxApps });
    return {
      ok: result.complete,
      result,
      message: result.complete ? 'The derivation is complete and every line checks.' : (result.problems[0] ?? 'Some lines need attention.'),
    };
  },
  answer: (ex) => ex.solution.map(([text, just]) => ({ text, just })),
};

// Describe a model of class equations as membership of individuals in classes.
function describeClasses(m, dict) {
  const ids = Array.from({ length: m.size }, (_, i) => i);
  const letters = Object.keys(m.preds).filter((p) => /^[A-Z]$/.test(p)).sort();
  const parts = [`Take ${m.size === 1 ? 'a single individual' : `${m.size} individuals`}.`];
  for (const i of ids) {
    const inside = letters.filter((p) => m.preds[p].has(String(i))).map((p) => p.toLowerCase());
    const gloss = (c) => (dict?.[c] ? ` (${dict[c]})` : '');
    parts.push(`Individual ${i + 1} is ${inside.length ? `in ${inside.map((c) => `${c}${gloss(c)}`).join(' and ')}` : 'in none of the classes'}.`);
  }
  return parts.join(' ');
}

// Writing a categorical statement (or any statement about classes) as a class equation.
EXTRA_TYPES.classeq = {
  check(ex, input) {
    const r = AL.parseEquation(input ?? '');
    if (!r.ok) return { ok: false, kind: 'parse', message: r.error.message };
    const keys = [ex.key, ...(ex.alternatives ?? [])].map((k) => AL.parseEquation(k).eq);
    const ans = AL.classFormula(r.eq);
    const key = AL.classFormula(keys[0]);
    if (keys.some((k) => AL.equalEq(k, r.eq))) return { ok: true, certainty: 'proved', message: 'Correct.' };
    const c = FO.compare(ans, key);
    if (c.equivalent === true) return { ok: true, certainty: 'proved', message: `Correct: the same as ${AL.printEquation(keys[0])}.` };
    if (c.equivalent === false) {
      const yours = FO.evaluate(ans, c.model);
      return {
        ok: false, kind: 'countermodel',
        message: `They come apart here. ${describeClasses(c.model, ex.dictionary)} Your equation is ${yours ? 'true' : 'false'} of this universe, but the statement is ${yours ? 'false' : 'true'}.`,
      };
    }
    return { ok: false, message: 'That could not be decided.' };
  },
  answer: (ex) => ex.key,
};

// A finite structure: a formal context (individuals and relations), or an
// algebra given by tables. The student marks what holds.
export function structureModel(s) {
  const index = new Map(s.individuals.map((x, i) => [x, i]));
  const preds = {};
  for (const [p, tuples] of Object.entries(s.relations ?? {})) {
    preds[p] = new Set(tuples.map((t) => [t].flat().map((x) => index.get(x)).join(',')));
  }
  const consts = Object.fromEntries(Object.entries(s.names ?? {}).map(([c, x]) => [c, index.get(x)]));
  return { size: s.individuals.length, consts, preds, letters: {} };
}

export function structureAnswer(ex) {
  if (ex.algebra) {
    const r = AL.checkPostulates(AL.algebraFrom(ex.algebra));
    return Object.keys(r).filter((k) => !r[k].holds);
  }
  const m = structureModel(ex.structure);
  return ex.statements.map((t, i) => [t, i]).filter(([t]) => FO.evaluate(parseFormula(t).ast, m)).map(([, i]) => i);
}

EXTRA_TYPES.structure = {
  check(ex, input) {
    const want = structureAnswer(ex);
    const got = [...(input ?? [])].sort();
    const same = want.length === got.length && [...want].sort().every((x, i) => String(x) === String(got[i]));
    if (same) return { ok: true, message: ex.explain ?? 'Correct.' };
    if (ex.algebra) {
      const r = AL.checkPostulates(AL.algebraFrom(ex.algebra));
      const wrong = got.filter((g) => r[g]?.holds).concat(want.filter((w) => !got.includes(w)));
      const w = wrong[0];
      const detail = r[w]?.holds
        ? `Postulate ${w} holds for every choice of elements in this system.`
        : `Postulate ${w} fails: ${r[w].statement}${r[w].env ? ` is false when ${Object.entries(r[w].env).map(([k, v]) => `${k} = ${v}`).join(', ')}` : ''}.`;
      return { ok: false, message: `Not quite. ${detail}` };
    }
    const m = structureModel(ex.structure);
    const wrong = ex.statements.map((t, i) => i).find((i) => want.includes(i) !== got.map(Number).includes(i));
    const truth = FO.evaluate(parseFormula(ex.statements[wrong]).ast, m);
    return { ok: false, message: `Look again at statement ${wrong + 1}: in this context it is ${truth ? 'true' : 'false'}.` };
  },
  answer: structureAnswer,
};
