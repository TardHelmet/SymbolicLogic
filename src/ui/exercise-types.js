// Exercise widgets beyond the sentential core: countermodels (Part II),
// many-valued tables and Kripke models (Part III).

import { h, clear, formula, formulaText } from './dom.js';
import { registerType } from './exercise.js';
import { argumentOf, formulasOf } from '../logic/check.js';
import '../logic/extra-types.js';
import * as FO from '../logic/models.js';
import { parseFormula } from '../logic/parser.js';
import { checkProof } from '../logic/proof.js';

function dictionaryList(dict) {
  if (!dict || !Object.keys(dict).length) return null;
  return h('ul', { class: 'dictionary', 'aria-label': 'Dictionary' },
    Object.entries(dict).map(([k, v]) => h('li', {}, h('span', { class: 'f' }, k), v)));
}

let uid = 0;

registerType('countermodel', 'Build a world', (ex) => {
  const id = `cm${++uid}`;
  const goal = ex.argument ? argumentOf(ex) : { premises: [], conclusion: null, formulas: formulasOf(ex) };
  const all = [...goal.premises, ...(goal.conclusion ? [goal.conclusion] : []), ...(goal.formulas ?? [])];
  const sig = FO.signature(all);
  const maxSize = ex.maxSize ?? 4;
  const state = { size: Math.min(2, maxSize), consts: {}, preds: {}, letters: {} };
  for (const [p] of sig.preds) state.preds[p] = new Set();
  for (const c of sig.consts) state.consts[c] = 0;
  for (const l of sig.letters) state.letters[l] = false;

  const builder = h('div', { class: 'model-builder' });
  const results = h('div', { class: 'model-results', 'aria-live': 'polite' });

  const draw = () => {
    clear(builder);
    const n = state.size;
    const ids = Array.from({ length: n }, (_, i) => i);

    const sizeRow = h('div', { class: 'model-row' }, h('span', { class: 'model-label' }, 'Individuals'),
      h('div', { class: 'segmented', role: 'group', 'aria-label': 'Number of individuals' },
        Array.from({ length: maxSize }, (_, i) => i + 1).map((k) => h('button', {
          type: 'button', 'aria-pressed': String(k === n),
          onclick: () => {
            state.size = k;
            for (const c of sig.consts) state.consts[c] = Math.min(state.consts[c], k - 1);
            for (const [p] of sig.preds) {
              state.preds[p] = new Set([...state.preds[p]].filter((key) => key.split(',').every((x) => +x < k)));
            }
            draw();
          },
        }, String(k)))));
    builder.append(sizeRow);

    if (sig.consts.length) {
      builder.append(h('div', { class: 'model-row' }, h('span', { class: 'model-label' }, 'Names'),
        h('div', { class: 'model-names' }, sig.consts.map((c) => {
          const sel = h('select', { id: `${id}-c-${c}`, 'aria-label': `Individual named ${c}` },
            ids.map((i) => h('option', { value: String(i), selected: state.consts[c] === i ? true : null }, String(i + 1))));
          sel.addEventListener('change', () => { state.consts[c] = +sel.value; });
          return h('label', { class: 'f', for: `${id}-c-${c}` }, `${c} names `, sel);
        }))));
    }

    const monadic = sig.preds.filter(([, k]) => k === 1);
    if (monadic.length) {
      const table = h('table', { class: 'tt model-table' },
        h('thead', {}, h('tr', {}, h('th', {}, ''), ids.map((i) => h('th', { scope: 'col' }, String(i + 1))))),
        h('tbody', {}, monadic.map(([p]) => h('tr', {}, h('th', { scope: 'row', class: 'f' }, p),
          ids.map((i) => {
            const box = h('input', { type: 'checkbox', 'aria-label': `${p} holds of ${i + 1}`, checked: state.preds[p].has(String(i)) ? true : null });
            box.addEventListener('change', () => { box.checked ? state.preds[p].add(String(i)) : state.preds[p].delete(String(i)); });
            return h('td', {}, box);
          })))));
      builder.append(h('div', { class: 'model-row' }, h('span', { class: 'model-label' }, 'Properties'),
        h('div', { class: 'tt-wrap' }, table), h('p', { class: 'small muted' }, 'Tick a box when the property holds of that individual.')));
    }

    for (const [p] of sig.preds.filter(([, k]) => k === 2)) {
      const table = h('table', { class: 'tt model-table' },
        h('thead', {}, h('tr', {}, h('th', {}, h('span', { class: 'f' }, `${p}xy`)), ids.map((j) => h('th', { scope: 'col' }, `y = ${j + 1}`)))),
        h('tbody', {}, ids.map((i) => h('tr', {}, h('th', { scope: 'row' }, `x = ${i + 1}`),
          ids.map((j) => {
            const key = `${i},${j}`;
            const box = h('input', { type: 'checkbox', 'aria-label': `${p} holds of ${i + 1}, ${j + 1}`, checked: state.preds[p].has(key) ? true : null });
            box.addEventListener('change', () => { box.checked ? state.preds[p].add(key) : state.preds[p].delete(key); });
            return h('td', {}, box);
          })))));
      builder.append(h('div', { class: 'model-row' }, h('span', { class: 'model-label' }, `Relation ${p}`), h('div', { class: 'tt-wrap' }, table)));
    }

    if (sig.letters.length) {
      builder.append(h('div', { class: 'model-row' }, h('span', { class: 'model-label' }, 'Statements'),
        h('div', { class: 'valuation' }, sig.letters.map((l) => {
          const box = h('input', { type: 'checkbox', 'aria-label': `${l} is true`, checked: state.letters[l] ? true : null });
          box.addEventListener('change', () => { state.letters[l] = box.checked; });
          return h('label', { class: 'f' }, box, ` ${l} true`);
        }))));
    }
  };
  draw();

  const given = ex.argument ? h('div', { class: 'given' }, formulaText(ex.argument))
    : h('div', { class: 'given' }, goal.formulas.flatMap((f, i) => (i ? [',   ', formula(f)] : [formula(f)])));

  return {
    el: [dictionaryList(ex.dictionary), given, builder, results],
    value: () => ({
      size: state.size,
      consts: { ...state.consts },
      letters: { ...state.letters },
      preds: Object.fromEntries(Object.entries(state.preds).map(([p, s]) => [p, [...s]])),
    }),
    show: (ans) => {
      state.size = ans.size;
      Object.assign(state.consts, ans.consts);
      Object.assign(state.letters, ans.letters ?? {});
      for (const [p] of sig.preds) state.preds[p] = new Set(ans.preds?.[p] ?? []);
      draw();
    },
    mark: (res) => {
      clear(results);
      if (!res.results) return;
      results.append(h('ul', { class: 'model-eval' }, res.results.map((r) => h('li', { class: r.value === r.want ? 'good' : 'bad' },
        h('span', { class: 'role' }, r.role === 'conclusion' ? 'Conclusion' : r.role === 'premise' ? 'Premise' : 'Formula'),
        formula(r.f),
        h('span', { class: `chip ${r.value ? 'ok' : 'shown'}` }, r.value ? 'true' : 'false')))));
    },
  };
});

registerType('flag-step', 'Find the error', (ex) => {
  const { premises, conclusion } = argumentOf(ex);
  let chosen = null;
  const rows = [];
  const box = h('div', { class: 'proof flag', role: 'group', 'aria-label': 'Proof to check' });
  premises.forEach((p, i) => {
    box.append(h('div', { class: `proof-row${i === premises.length - 1 ? ' premise-last' : ''}` },
      h('span', { class: 'n' }, `${i + 1}.`),
      h('span', { class: 'body' }, h('span', { class: 'static' }, formula(p), i === premises.length - 1 ? h('span', { class: 'concl' }, '/ ', formula(conclusion)) : null)),
      h('span', { class: 'just-static' }, ''), h('span', {})));
  });
  if (!premises.length) {
    box.append(h('div', { class: 'proof-row premise-last' }, h('span', { class: 'n' }, ''),
      h('span', { class: 'body' }, h('span', { class: 'static' }, h('span', { class: 'concl' }, '/ ', formula(conclusion)))), h('span', {}), h('span', {})));
  }
  // Depths come from the checker, so the scope lines are drawn correctly.
  const checked = checkProof({ premises, conclusion, lines: ex.lines.map(([text, just]) => ({ text, just })) });
  ex.lines.forEach(([text, just], i) => {
    const n = premises.length + i + 1;
    const scope = h('span', { class: 'scope', 'aria-hidden': 'true' });
    const btn = h('button', { type: 'button', class: 'flag-btn proof-row', 'aria-pressed': 'false', 'aria-label': `Line ${n}` },
      h('span', { class: 'n' }, `${n}.`),
      h('span', { class: 'body' }, scope, h('span', { class: 'static' }, formula(parseFormula(text).ast))),
      h('span', { class: 'just-static' }, just));
    btn.addEventListener('click', () => {
      chosen = n;
      rows.forEach((r) => r.btn.setAttribute('aria-pressed', String(r.n === n)));
    });
    scope.style.setProperty('--depth', checked.lines[n - 1].depth);
    rows.push({ n, btn, scope });
    box.append(btn);
  });
  return {
    el: [dictionaryList(ex.dictionary), h('p', { class: 'small muted' }, 'Click the line whose rule is misapplied.'), box],
    value: () => chosen,
    show: (n) => { chosen = n; rows.forEach((r) => r.btn.setAttribute('aria-pressed', String(r.n === n))); },
  };
});
