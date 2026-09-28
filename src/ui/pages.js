// Home, sandbox, reference and sources pages.

import { h, clear, inline, formula, formulaText } from './dom.js';
import { formulaInput } from './formula-input.js';
import { proofEditor } from './proof-editor.js';
import { staticTable, ruleTable, renderBlock } from './lesson.js';
import { cite } from './cite.js';
import { lessonProgress } from './state.js';
import { BIB } from '../course/bibliography.js';
import { parseFormula, parseArgument } from '../logic/parser.js';
import { mainOperator, print } from '../logic/printer.js';
import { isSentential, classifyStatement, validity, showRow } from '../logic/semantics.js';
import * as FO from '../logic/models.js';
import { checkProof, hints } from '../logic/proof.js';

// --- home ------------------------------------------------------------------------

export function renderHome(parts) {
  const hero = h('header', { class: 'hero' },
    h('h1', {}, 'Symbolic logic, from the Stoics to possible worlds'),
    h('p', {}, 'A course in sentential and predicate logic in the notation of Hurley and Copi, followed by a short passage into the logics that reject some classical laws. You read, then work: every truth table, translation and proof you enter is checked by a logic engine, and when something is wrong it tells you why.'),
    h('div', { class: 'formula-line', 'aria-label': 'If the first, then the second; the first; therefore the second.' }, formulaText('p ⊃ q, p / q')),
    h('p', { class: 'small muted' }, 'The first of the Stoic “indemonstrables”, now called modus ponens. It is where the course begins.'));

  const notes = h('div', { class: 'notes' },
    h('section', {}, h('h2', {}, 'Checked by logic'), h('p', {}, 'Answers are marked by what they mean. Any formula equivalent to the right translation is accepted; a wrong one gets a concrete situation where it and the sentence come apart.')),
    h('section', {}, h('h2', {}, 'Hurley’s notation'), h('p', {}, inline('Type {!~}, {!•}, {!∨}, {!⊃}, {!≡} with the palette or as ~ . v > <->. The switch at the top shows everything in modern notation instead, as used by most philosophy journals.'))),
    h('section', {}, h('h2', {}, 'Margins'), h('p', {}, 'Each lesson has a margin on where its ideas come from and what has been argued about them, with sources you can follow up.')));

  const partEls = parts.map((part) => h('section', { class: 'part' },
    h('h2', {}, `Part ${part.numeral}. ${part.title}`),
    h('p', { class: 'blurb' }, inline(part.blurb)),
    h('div', { class: 'cards' }, part.lessons.map((l) => {
      const p = lessonProgress(l);
      return h('a', { class: 'card', href: `#/lesson/${l.id}` },
        h('span', { class: 'n' }, h('span', {}, `Lesson ${l.number}`), p.total ? h('span', {}, `${p.solved}/${p.total}`) : null),
        h('span', { class: 't' }, l.title),
        l.card ? h('span', { class: 'd' }, inline(l.card, { links: false })) : null);
    }))));

  return h('div', { class: 'home' }, hero, notes, h('div', { class: 'parts' }, partEls));
}

// --- sandbox ------------------------------------------------------------------------

function formulaPanel() {
  const out = h('div', { class: 'out', 'aria-live': 'polite' });
  const fin = formulaInput({ id: 'sb-formula', label: 'Formula', set: 'predicate', onEnter: () => run() });
  const run = () => {
    clear(out);
    const r = parseFormula(fin.value.trim(), { closed: true });
    if (!r.ok) { out.append(h('p', { class: 'muted' }, r.error.message)); return; }
    const f = r.ast;
    const dl = h('dl', { class: 'kv' },
      h('dt', {}, 'Read as'), h('dd', {}, formula(f)),
      h('dt', {}, 'Main operator'), h('dd', {}, mainOperator(f).name));
    out.append(dl);
    if (isSentential(f)) {
      dl.append(h('dt', {}, 'Classification'), h('dd', {}, classifyStatement(f)));
      out.append(staticTable([print(f)], 'all'));
    } else {
      const v = FO.validity([], f);
      const s = FO.satisfiable([f]);
      dl.append(h('dt', {}, 'Logically true?'), h('dd', {}, v.valid ? `Yes${v.certainty === 'provisional' ? ' (no counterexample found among small models)' : ''}` : 'No'));
      if (!v.valid) dl.append(h('dt', {}, 'False in'), h('dd', {}, FO.describeModel(v.model)));
      dl.append(h('dt', {}, 'Satisfiable?'), h('dd', {}, s.satisfiable ? 'Yes' : `No${s.certainty === 'provisional' ? ' (no model found among small ones)' : ''}`));
      if (s.satisfiable) dl.append(h('dt', {}, 'True in'), h('dd', {}, FO.describeModel(s.model)));
    }
  };
  return h('section', { class: 'panel' }, h('h2', {}, 'A formula'),
    h('p', { class: 'small muted' }, 'Its structure, its truth table, and whether it is tautologous, contingent or self-contradictory.'),
    fin.el, h('div', { class: 'actions' }, h('button', { type: 'button', class: 'btn primary', onclick: run }, 'Analyse')), out);
}

function argumentPanel() {
  const out = h('div', { class: 'out', 'aria-live': 'polite' });
  const input = h('input', { id: 'sb-arg', type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Argument', placeholder: 'A > B, ~B / ~A', class: '' });
  const wrap = h('div', { class: 'fin' }, input);
  const run = () => {
    clear(out);
    const r = parseArgument(input.value.trim(), { closed: true });
    if (!r.ok) { out.append(h('p', { class: 'muted' }, r.error.message)); return; }
    const all = [...r.premises, r.conclusion];
    if (all.every(isSentential)) {
      const v = validity(r.premises, r.conclusion);
      out.append(h('p', {}, v.valid ? 'Valid: no row of the truth table makes every premise true and the conclusion false.' : `Invalid. Counterexample: ${showRow(v.counterexamples[0])}.`));
    } else {
      const v = FO.validity(r.premises, r.conclusion);
      out.append(h('p', {}, v.valid
        ? `Valid${v.certainty === 'provisional' ? ' as far as the search can tell: no counterexample among small models' : ''}.`
        : `Invalid. ${FO.describeModel(v.model)} There every premise is true and the conclusion false.`));
    }
  };
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
  return h('section', { class: 'panel' }, h('h2', {}, 'An argument'),
    h('p', { class: 'small muted' }, inline('Premises separated by commas, then {/} and the conclusion.')),
    wrap, h('div', { class: 'actions' }, h('button', { type: 'button', class: 'btn primary', onclick: run }, 'Test validity')), out);
}

function proofPanel() {
  const holder = h('div', { style: 'display:grid;gap:0.7rem;min-width:0' });
  const feedback = h('div', { class: 'feedback', 'aria-live': 'polite' });
  const input = h('input', { id: 'sb-proof-arg', type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Argument to prove', placeholder: '(x)(Fx > Gx), Fa / Ga' });
  const start = () => {
    clear(holder); clear(feedback); feedback.className = 'feedback';
    const r = parseArgument(input.value.trim(), { closed: true });
    if (!r.ok) { holder.append(h('p', { class: 'muted' }, r.error.message)); return; }
    const ed = proofEditor({ premises: r.premises, conclusion: r.conclusion, set: 'predicate' });
    const say = (kind, lines) => { clear(feedback); feedback.className = `feedback ${kind}`; lines.forEach((l) => feedback.append(h('p', {}, l))); };
    holder.append(ed.el, h('div', { class: 'actions' },
      h('button', { type: 'button', class: 'btn primary', onclick: () => {
        const res = checkProof({ premises: r.premises, conclusion: r.conclusion, lines: ed.value() });
        ed.mark(res);
        say(res.complete ? 'ok' : 'bad', [res.complete ? 'The proof is complete and every line checks.' : res.problems[0] ?? 'Some lines need attention.']);
      } }, 'Check'),
      h('button', { type: 'button', class: 'btn quiet', onclick: () => say('info', hints({ premises: r.premises, conclusion: r.conclusion, lines: ed.value() })) }, 'Hint')));
    ed.focus();
  };
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') start(); });
  return h('section', { class: 'panel' }, h('h2', {}, 'A proof'),
    h('p', { class: 'small muted' }, 'Enter any argument and prove it with Hurley’s rules.'),
    h('div', { class: 'fin' }, input), h('div', { class: 'actions' }, h('button', { type: 'button', class: 'btn primary', onclick: start }, 'Start proof')), holder, feedback);
}

export function renderSandbox() {
  return h('div', { class: 'tool-page' },
    h('header', {}, h('h1', {}, 'Sandbox'), h('p', {}, 'Try anything: formulas, arguments, proofs. Nothing here is marked or saved.')),
    formulaPanel(), argumentPanel(), proofPanel());
}

// --- reference --------------------------------------------------------------------------

const SYMBOLS = [
  ['~', '¬', '~  -  !', 'tilde', 'negation: not', 'N'],
  ['•', '∧', '.  &  *', 'dot', 'conjunction: and', 'K'],
  ['∨', '∨', 'v  |', 'wedge', 'disjunction: or (inclusive)', 'A'],
  ['⊃', '→', '>  ->', 'horseshoe', 'conditional: if … then', 'C'],
  ['≡', '↔', '<->  ==', 'triple bar', 'biconditional: if and only if', 'E'],
  ['(x)', '∀x', '(x)', 'universal quantifier', 'for every x', 'Π'],
  ['(∃x)', '∃x', '(Ex)', 'existential quantifier', 'there is an x such that', 'Σ'],
  ['=', '=', '=', 'identity', 'is the same individual as', 'I'],
  ['□', '□', '[]', 'box', 'necessarily', 'L'],
  ['◇', '◇', '<>', 'diamond', 'possibly', 'M'],
];

export function renderReference() {
  const sym = h('div', { class: 'ref-table-wrap' }, h('table', { class: 'ref' },
    h('thead', {}, h('tr', {}, ['Hurley', 'Modern', 'Type', 'Name', 'Reading', 'Polish'].map((t) => h('th', {}, t)))),
    h('tbody', {}, SYMBOLS.map(([hur, mod, type, name, reading, pol]) => h('tr', {},
      h('td', { class: 'f' }, hur), h('td', { class: 'f' }, mod), h('td', {}, h('code', {}, type)), h('td', {}, name), h('td', {}, reading), h('td', { class: 'f' }, pol))))));
  return h('div', { class: 'tool-page' },
    h('header', {}, h('h1', {}, 'Reference'), h('p', {}, 'Symbols, truth tables and every rule used in the course.')),
    h('section', { class: 'panel' }, h('h2', {}, 'Symbols'), sym,
      h('p', { class: 'small muted' }, inline('Statement letters are capitals. Predicates are capitals followed by names or variables, as in {Fa} or {Rxy}. Names (individual constants) are a–u and w; lowercase v is always the wedge. Variables are x, y, z, with x₁, x₂… (typed x1, x2) when more are needed. Polish notation, due to Łukasiewicz, writes operators first and needs no brackets: {(A • B) ⊃ C} is CKabc.'))),
    h('section', { class: 'panel' }, h('h2', {}, 'The five truth functions'), staticTable(['~p', 'p • q', 'p ∨ q', 'p ⊃ q', 'p ≡ q'])),
    h('section', { class: 'panel' }, h('h2', {}, 'Rules of implication'), h('p', { class: 'small muted' }, 'Apply to whole lines only.'), ruleTable(['MP', 'MT', 'HS', 'DS', 'CD', 'Simp', 'Conj', 'Add'])),
    h('section', { class: 'panel' }, h('h2', {}, 'Rules of replacement'), h('p', { class: 'small muted' }, inline('Apply to whole lines or to any part of a line; {!::} means the two forms may replace each other.')), ruleTable(['DM', 'Com', 'Assoc', 'Dist', 'DN', 'Trans', 'Impl', 'Equiv', 'Exp', 'Taut'])),
    h('section', { class: 'panel' }, h('h2', {}, 'Conditional and indirect proof'),
      renderBlock('**Conditional proof.** Assume the antecedent of the conditional you want (justify it ACP). Derive the consequent. Then write the conditional, citing the whole indented sequence, as in “3–7, CP”.'),
      renderBlock('**Indirect proof.** Assume the negation of what you want (AIP). Derive a contradiction of the form {p • ~p}. Then write the negation of the assumption, citing the sequence with IP, and use DN if needed.'),
      renderBlock('Lines inside an indented sequence cannot be cited once the sequence is closed.')),
    h('section', { class: 'panel' }, h('h2', {}, 'Quantifier and identity rules'), ruleTable(['UI', 'UG', 'EI', 'EG', 'CQ', 'Id']),
      h('ul', { class: 'small' },
        h('li', {}, inline('**UI**: replace every free occurrence of the quantified variable with the same name or variable, and do not let another quantifier capture it.')),
        h('li', {}, inline('**EI**: the name must be new to the proof and must not appear in the conclusion.')),
        h('li', {}, inline('**UG**: generalize only on a variable, never a name; not inside an indented sequence whose first line has that variable free; and not on a variable that is free in a line obtained by EI.')),
        h('li', {}, inline('**Id**: from nothing, {a = a}; from {a = b}, {b = a}; from a line about a and {a = b}, the same line with b for some occurrences of a.')))),
    h('section', { class: 'panel' }, h('h2', {}, 'Strategy'),
      h('ul', {},
        h('li', {}, 'Look at the conclusion’s main operator and work backward from it.'),
        h('li', {}, inline('To prove {p ⊃ q}, assume {p} and derive {q}.')),
        h('li', {}, inline('To prove {~p}, or when stuck, assume {p} and aim for a contradiction.')),
        h('li', {}, 'Break premises down: Simp for conjunctions, MP and MT for conditionals, DS for disjunctions.'),
        h('li', {}, 'Use replacement rules to put a line into the shape a rule of implication needs.'),
        h('li', {}, 'In predicate proofs, do EI before UI, so that the new name can be used when instantiating universals.'))));
}

// --- sources ----------------------------------------------------------------------------------

export function renderSources(lessons) {
  const usedIn = new Map();
  for (const l of lessons) for (const id of l.margin?.sources ?? []) {
    if (!usedIn.has(id)) usedIn.set(id, []);
    usedIn.get(id).push(l);
  }
  const ids = Object.keys(BIB).sort((a, b) => BIB[a].author.localeCompare(BIB[b].author) || String(BIB[a].year).localeCompare(String(BIB[b].year)));
  return h('div', { class: 'tool-page' },
    h('header', {}, h('h1', {}, 'Sources'), h('p', {}, inline('Everything cited in the margins. Open-access texts are linked. The course follows the notation and rules of Hurley & Watson, *A Concise Introduction to Logic*; *forall x: Calgary* is a free textbook covering much of the same ground in modern notation.'))),
    h('section', { class: 'panel' }, h('ol', { class: 'bib' }, ids.map((id) => h('li', { id: `src-${id}` }, cite(id),
      usedIn.has(id) ? h('span', { class: 'used' }, 'In: ', usedIn.get(id).map((l, i) => [i ? ', ' : '', h('a', { href: `#/lesson/${l.id}` }, l.title)])) : null)))));
}
