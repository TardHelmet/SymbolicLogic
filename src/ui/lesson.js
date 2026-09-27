// Lesson pages: reading, worked examples, exercises and the margin.

import { h, inline, formula, formulaText } from './dom.js';
import { renderExercise } from './exercise.js';
import { cite } from './cite.js';
import { truthTable, columns } from '../logic/semantics.js';
import { parseFormula } from '../logic/parser.js';
import { parseProofText, checkProof } from '../logic/proof.js';
import { IMPLICATION, REPLACEMENT, OTHER } from '../logic/rules.js';
import * as A from '../logic/ast.js';

export function staticTable(formulaTexts, cols = 'main') {
  const fs = formulaTexts.map((t) => parseFormula(t, { schema: /\b[pqrs]\b/.test(t) && !/[A-Z]/.test(t) }).ast);
  const all = cols === 'all' ? fs.flatMap((f) => columns(f)) : fs;
  const { letters, rows } = truthTable(all);
  const mains = new Set(fs.map((f) => A.key(f)));
  return h('div', { class: 'tt-wrap' }, h('table', { class: 'tt' },
    h('thead', {}, h('tr', {}, letters.map((l) => h('th', { class: 'letters' }, l)), all.map((c, j) => h('th', { class: j === 0 ? 'sep' : null }, formula(c))))),
    h('tbody', {}, rows.map((r) => h('tr', {},
      letters.map((l) => h('td', { class: `letters ${r.v[l] ? 'T' : 'F'}` }, r.v[l] ? 'T' : 'F')),
      r.values.map((v, j) => h('td', { class: [j === 0 ? 'sep' : '', v ? 'T' : 'F', mains.has(A.key(all[j])) ? 'main' : ''].join(' ') }, v ? 'T' : 'F')))))));
}

export function staticProof(text) {
  const p = parseProofText(text);
  if (p.error) return h('p', { class: 'muted' }, text);
  const res = checkProof(p);
  const box = h('div', { class: 'proof', role: 'group', 'aria-label': 'Worked proof' });
  if (!p.premises.length) {
    box.append(h('div', { class: 'proof-row premise-last' }, h('span', { class: 'n' }, ''),
      h('span', { class: 'body' }, h('span', { class: 'static' }, h('span', { class: 'concl' }, '/ ', formula(p.conclusion)))), h('span', {}), h('span', {})));
  }
  res.lines.forEach((l, i) => {
    const isLastPremise = i === p.premises.length - 1;
    box.append(h('div', { class: `proof-row${isLastPremise ? ' premise-last' : ''}` },
      h('span', { class: 'n' }, `${l.n}.`),
      h('span', { class: 'body' },
        h('span', { class: 'scope', style: `--depth:${l.depth}`, 'aria-hidden': 'true' }),
        h('span', { class: 'static' }, l.formula ? formula(l.formula) : l.text, isLastPremise ? h('span', { class: 'concl' }, '/ ', formula(p.conclusion)) : null)),
      h('span', { class: 'just-static' }, l.rule === 'Premise' ? '' : l.just),
      h('span', {})));
  });
  return box;
}

export function ruleTable(ids) {
  const rows = ids.map((id) => {
    const r = IMPLICATION[id] ?? REPLACEMENT[id] ?? OTHER[id];
    const forms = [r.display].flat();
    return h('tr', {},
      h('td', { class: 'abbr' }, id),
      h('td', {}, r.name),
      h('td', {}, forms.map((d, i) => [i ? h('br') : null, schemaText(d)])));
  });
  return h('div', { class: 'ref-table-wrap' }, h('table', { class: 'ref' },
    h('thead', {}, h('tr', {}, h('th', {}, 'Rule'), h('th', {}, 'Name'), h('th', {}, 'Form'))),
    h('tbody', {}, rows)));
}

// Rule displays like "p ⊃ q, p / q" or "~(p • q) :: (~p ∨ ~q)", with metavariables in italics.
function schemaText(d) {
  const span = h('span', { class: 'f' });
  d.split(/(\s::\s|\s\/\s|,\s|\s{2}or\s{2})/).forEach((part) => {
    if (/^(\s::\s|\s\/\s|,\s|\s{2}or\s{2})$/.test(part)) { span.append(part); return; }
    [...part].forEach((ch) => span.append(/[pqrs]/.test(ch) ? h('i', {}, ch) : ch));
  });
  return span;
}

function example(block) {
  const steps = block.steps ?? [];
  const list = h('ol', {});
  const items = steps.map((s) => h('li', {}, h('span', {}, typeof s === 'string' ? inline(s) : renderBlock(s))));
  const box = h('div', { class: 'example' }, h('span', { class: 'label' }, block.example || 'Worked example'), list);
  if (!block.stepwise) { items.forEach((i) => list.append(i)); return box; }
  let shown = 1;
  list.append(items[0]);
  const next = h('button', { type: 'button', class: 'btn reveal' }, 'Next step');
  next.addEventListener('click', () => {
    list.append(items[shown++]);
    if (shown >= items.length) next.remove();
  });
  if (items.length > 1) box.append(next);
  return box;
}

export function renderBlock(b) {
  if (typeof b === 'string') return h('p', {}, inline(b));
  if (b.h) return h('h2', {}, inline(b.h));
  if (b.h3) return h('h3', {}, inline(b.h3));
  if (b.def) return h('div', { class: 'definition' }, h('span', { class: 'term' }, b.def), inline(b.text));
  if (b.display) return h('div', { class: 'display' }, b.plain ? b.display : formulaText(b.display));
  if (b.list) return h('ul', {}, b.list.map((i) => h('li', {}, inline(i))));
  if (b.ol) return h('ol', {}, b.ol.map((i) => h('li', {}, inline(i))));
  if (b.example !== undefined) return example(b);
  if (b.quote) return h('blockquote', { class: 'quote' }, h('p', {}, inline(b.quote)), b.source ? h('footer', {}, inline(b.source)) : null);
  if (b.table) return staticTable(b.table, b.columns);
  if (b.proof) return staticProof(b.proof);
  if (b.rules) return ruleTable(b.rules);
  if (b.aside) return h('div', { class: 'definition' }, h('span', { class: 'term' }, b.label ?? 'Note'), inline(b.aside));
  return h('p', {}, JSON.stringify(b));
}

export function renderMargin(margin) {
  if (!margin) return null;
  return h('aside', { class: 'margin', 'aria-label': 'In the margin' },
    h('span', { class: 'label' }, 'In the margin'),
    margin.title ? h('h2', {}, inline(margin.title)) : null,
    (margin.body ?? []).map((p) => h('p', {}, inline(p))),
    margin.sources?.length ? h('div', { class: 'sources' }, h('h3', {}, 'Sources and further reading'), h('ol', {}, margin.sources.map((id) => h('li', {}, cite(id))))) : null);
}

export function renderLesson(lesson, { part, prev, next }) {
  const head = h('header', { class: 'lesson-head' },
    h('div', { class: 'eyebrow' },
      h('span', {}, `Part ${part.numeral} · Lesson ${lesson.number}`),
      lesson.hurley ? h('span', { class: 'hurley' }, `Hurley ${lesson.hurley}`) : null),
    h('h1', {}, lesson.title),
    lesson.summary ? h('p', { class: 'summary' }, inline(lesson.summary)) : null,
    h('div', { class: 'reading' }, (lesson.reading ?? []).map(renderBlock)));
  const exercises = h('section', { class: 'exercises', 'aria-label': 'Exercises' },
    h('h2', {}, 'Exercises'),
    lesson.exercisesIntro ? h('p', { class: 'intro' }, inline(lesson.exercisesIntro)) : null,
    (lesson.exercises ?? []).map((ex, i) => renderExercise(ex, i + 1)));
  const pager = h('nav', { class: 'pager', 'aria-label': 'Lessons' },
    prev ? h('a', { href: `#/lesson/${prev.id}` }, h('span', { class: 'dir' }, 'Previous'), prev.title) : null,
    next ? h('a', { href: `#/lesson/${next.id}`, class: 'next' }, h('span', { class: 'dir' }, 'Next'), next.title) : null);
  return h('article', { class: 'lesson' }, head, renderMargin(lesson.margin), exercises, pager);
}
