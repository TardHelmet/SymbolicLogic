// Content integrity: every exercise is solvable by its own key, every listed
// wrong answer is rejected, every formula in the text parses, every source
// resolves. An exercise that cannot be answered correctly cannot ship.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PARTS, LESSONS } from '../src/course/index.js';
import { BIB } from '../src/course/bibliography.js';
import { parseAny, inlineFormulas } from '../src/course/markup.js';
import { checkAnswer, modelAnswer, argumentOf, formulasOf } from '../src/logic/check.js';
import { parseFormula } from '../src/logic/parser.js';
import { parseProofText, checkProof } from '../src/logic/proof.js';
import { ALL_RULES } from '../src/logic/rules.js';
import { isSentential, validity } from '../src/logic/semantics.js';
import * as FO from '../src/logic/models.js';
import '../src/logic/extra-types.js';

const FIELDS = {
  common: ['id', 'type', 'prompt', 'explain', 'wrong'],
  translate: ['dictionary', 'key', 'alternatives', 'set'],
  readings: ['dictionary', 'keys'],
  'truth-table': ['formulas', 'columns'],
  classify: ['mode', 'formulas', 'argument', 'dictionary'],
  'main-operator': ['formula'],
  choice: ['options', 'answer', 'why', 'retry', 'given'],
  counterexample: ['argument', 'dictionary'],
  proof: ['argument', 'solution', 'allowedRules', 'maxApps', 'mode', 'blanks', 'set'],
  enthymeme: ['argument', 'key', 'dictionary', 'alternatives'],
  countermodel: ['argument', 'formulas', 'dictionary', 'goal', 'maxSize'],
  matrix: ['logic', 'argument', 'formulas', 'question'],
  kripke: ['model', 'formula', 'world', 'question', 'frame', 'logic'],
};

const REQUIRED = {
  translate: ['dictionary', 'key'],
  readings: ['keys'],
  'truth-table': ['formulas'],
  classify: ['mode'],
  'main-operator': ['formula'],
  choice: ['options', 'answer'],
  counterexample: ['argument'],
  proof: ['argument', 'solution'],
  enthymeme: ['argument', 'key'],
};

const allExercises = LESSONS.flatMap((l) => (l.exercises ?? []).map((ex) => ({ lesson: l, ex })));

test('ids are unique', () => {
  const lessonIds = LESSONS.map((l) => l.id);
  assert.equal(new Set(lessonIds).size, lessonIds.length, 'duplicate lesson id');
  const exIds = allExercises.map(({ ex }) => ex.id);
  const dupes = exIds.filter((id, i) => exIds.indexOf(id) !== i);
  assert.deepEqual(dupes, [], 'duplicate exercise ids');
});

test('lessons are numbered in order', () => {
  LESSONS.forEach((l, i) => assert.equal(l.number, i + 1, `lesson ${l.id} should be number ${i + 1}`));
  for (const p of PARTS) assert.ok(p.lessons.length > 0);
});

test('exercise fields are known and complete', () => {
  for (const { lesson, ex } of allExercises) {
    const allowed = new Set([...FIELDS.common, ...(FIELDS[ex.type] ?? [])]);
    assert.ok(FIELDS[ex.type], `${lesson.id}/${ex.id}: unknown type ${ex.type}`);
    for (const k of Object.keys(ex)) assert.ok(allowed.has(k), `${lesson.id}/${ex.id}: unknown field “${k}”`);
    for (const k of REQUIRED[ex.type] ?? []) assert.ok(ex[k] !== undefined, `${lesson.id}/${ex.id}: missing “${k}”`);
    assert.ok(ex.prompt, `${lesson.id}/${ex.id}: missing prompt`);
  }
});

test('every exercise accepts its own model answer', () => {
  for (const { lesson, ex } of allExercises) {
    const answer = modelAnswer(ex);
    const res = checkAnswer(ex, answer);
    const detail = res.result ? res.result.lines.filter((l) => !l.ok).map((l) => `${l.n}: ${l.errors.join(' ')}`).join('\n') : res.message;
    assert.ok(res.ok, `${lesson.id}/${ex.id}: its own answer is rejected.\n${detail}\n${res.result?.problems?.join('\n') ?? ''}`);
  }
});

test('alternative answers are accepted and wrong answers rejected', () => {
  for (const { lesson, ex } of allExercises) {
    for (const alt of ex.alternatives ?? []) {
      assert.ok(checkAnswer(ex, alt).ok, `${lesson.id}/${ex.id}: alternative “${alt}” rejected`);
    }
    for (const w of ex.wrong ?? []) {
      assert.ok(!checkAnswer(ex, w).ok, `${lesson.id}/${ex.id}: wrong answer “${JSON.stringify(w)}” accepted`);
    }
  }
});

test('choice answers point at real options', () => {
  for (const { lesson, ex } of allExercises.filter(({ ex }) => ex.type === 'choice')) {
    for (const a of [ex.answer].flat()) assert.ok(Number.isInteger(a) && a >= 0 && a < ex.options.length, `${lesson.id}/${ex.id}: bad answer index ${a}`);
    if (ex.why) assert.equal(ex.why.length, ex.options.length, `${lesson.id}/${ex.id}: why[] must match options`);
  }
});

test('proof exercises: closed, valid, and solved within the allowed rules', () => {
  for (const { lesson, ex } of allExercises.filter(({ ex }) => ex.type === 'proof')) {
    const { premises, conclusion } = argumentOf(ex);
    const all = [...premises, conclusion];
    const valid = all.every(isSentential) ? validity(premises, conclusion).valid : FO.validity(premises, conclusion).valid;
    assert.ok(valid, `${lesson.id}/${ex.id}: the argument is not valid`);
    for (const [, just] of ex.solution) assert.ok(typeof just === 'string');
    if (ex.mode === 'fill') assert.ok(ex.blanks?.length, `${lesson.id}/${ex.id}: fill mode needs blanks`);
  }
});

function blockTexts(b) {
  if (typeof b === 'string') return [b];
  const out = [];
  for (const k of ['h', 'h3', 'text', 'quote', 'source', 'aside']) if (b[k]) out.push(b[k]);
  for (const k of ['list', 'ol']) if (b[k]) out.push(...b[k]);
  if (b.steps) for (const s of b.steps) out.push(...(typeof s === 'string' ? [s] : blockTexts(s)));
  return out;
}

test('every formula in the text parses', () => {
  for (const l of LESSONS) {
    const texts = [l.summary, l.card, l.exercisesIntro, ...(l.reading ?? []).flatMap(blockTexts), ...(l.margin?.body ?? []), l.margin?.title];
    for (const ex of l.exercises ?? []) texts.push(ex.prompt, ex.explain, ...(ex.options ?? []), ...(ex.why ?? []).filter(Boolean), ...Object.values(ex.dictionary ?? {}));
    for (const t of texts) {
      for (const src of inlineFormulas(t)) assert.ok(parseAny(src), `${l.id}: cannot parse {${src}}`);
    }
    for (const b of l.reading ?? []) {
      if (b.display && !b.plain) assert.ok(parseAny(b.display), `${l.id}: cannot parse display “${b.display}”`);
      if (b.table) for (const t of b.table) assert.ok(parseAny(t), `${l.id}: cannot parse table formula “${t}”`);
      if (b.rules) for (const r of b.rules) assert.ok(ALL_RULES[r], `${l.id}: unknown rule ${r}`);
      if (b.proof) {
        const p = parseProofText(b.proof);
        assert.ok(!p.error, `${l.id}: worked proof does not parse: ${p.error}`);
        const res = checkProof(p);
        assert.ok(res.complete, `${l.id}: worked proof does not check:\n${res.lines.filter((x) => !x.ok).map((x) => `${x.n}: ${x.errors.join(' ')}`).join('\n')}`);
      }
    }
  }
});

test('translation keys use only their dictionary', () => {
  for (const { lesson, ex } of allExercises.filter(({ ex }) => ex.type === 'translate')) {
    const letters = Object.keys(ex.dictionary).filter((k) => /^[A-Z]$/.test(k));
    const r = parseFormula(ex.key, { closed: true, letters });
    assert.ok(r.ok, `${lesson.id}/${ex.id}: key “${ex.key}” — ${r.error?.message}`);
  }
});

test('truth-table and classify formulas parse as sentences', () => {
  for (const { lesson, ex } of allExercises.filter(({ ex }) => ex.formulas)) {
    assert.doesNotThrow(() => formulasOf(ex), `${lesson.id}/${ex.id}`);
  }
});

test('sources resolve, and every bibliography entry is cited', () => {
  const cited = new Set();
  for (const l of LESSONS) {
    for (const id of l.margin?.sources ?? []) {
      assert.ok(BIB[id], `${l.id}: unknown source ${id}`);
      cited.add(id);
    }
  }
  const orphans = Object.keys(BIB).filter((id) => !cited.has(id));
  assert.deepEqual(orphans, [], 'bibliography entries never cited');
});

// --- repository hygiene ---------------------------------------------------------

const ROOT = new URL('..', import.meta.url).pathname;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (['.git', 'node_modules', 'test'].includes(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(js|html|css|md|json|txt)$/.test(name)) out.push(p);
  }
  return out;
}

// Names kept off the site. Stored encoded so that this file does not itself
// contain them.
const BANNED = ['ZGVsZXV6ZQ==', 'Z3VhdHRhcmk=', 'bG9naWMgb2Ygc2Vuc2U=', 'ZGlmZmVyZW5jZSBhbmQgcmVwZXRpdGlvbg==', 'YW50aS1vZWRpcHVz', 'dGhvdXNhbmQgcGxhdGVhdXM=']
  .map((s) => Buffer.from(s, 'base64').toString());

test('no banned names anywhere in the site', () => {
  for (const file of walk(ROOT)) {
    const text = readFileSync(file, 'utf8').toLowerCase();
    for (const name of BANNED) assert.ok(!text.includes(name), `${relative(ROOT, file)} mentions a banned name`);
  }
});

test('the logic engine and content never touch the DOM; nothing uses innerHTML', () => {
  for (const file of walk(join(ROOT, 'src'))) {
    const text = readFileSync(file, 'utf8');
    const rel = relative(ROOT, file);
    if (rel.startsWith('src/logic') || rel.startsWith('src/course')) {
      assert.ok(!/\bdocument\./.test(text) && !/\bwindow\./.test(text), `${rel} touches the DOM`);
    }
    assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML/.test(text), `${rel} uses innerHTML`);
  }
});
