// Exercise widgets beyond the sentential core: countermodels (predicate
// logic), derivations in the algebra of classes, class equations and finite
// structures (form and system), many-valued tables and Kripke models (the
// non-classical part).

import { h, clear, formula, formulaText, inline } from './dom.js';
import { registerType } from './exercise.js';
import { argumentOf, formulasOf } from '../logic/check.js';
import '../logic/extra-types.js';
import * as FO from '../logic/models.js';
import { parseFormula, parseArgument } from '../logic/parser.js';
import { checkProof } from '../logic/proof.js';
import * as MV from '../logic/manyvalued.js';
import * as K from '../logic/kripke.js';
import * as AL from '../logic/algebra.js';
import { proofEditor } from './proof-editor.js';
import { palette } from './formula-input.js';

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
      h('span', { class: 'body' }, h('span', { class: 'static' }, formula(p), i === premises.length - 1 ? h('span', { class: 'concl' }, '/∴ ', formula(conclusion)) : null)),
      h('span', { class: 'just-static' }, ''), h('span', {})));
  });
  if (!premises.length) {
    box.append(h('div', { class: 'proof-row premise-last' }, h('span', { class: 'n' }, ''),
      h('span', { class: 'body' }, h('span', { class: 'static' }, h('span', { class: 'concl' }, '/∴ ', formula(conclusion)))), h('span', {}), h('span', {})));
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

// --- Non-classical widgets -----------------------------------------------------------

const SVG = 'http://www.w3.org/2000/svg';
function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  for (const c of kids) el.append(c);
  return el;
}

const POS = { 1: [[70, 70]], 2: [[60, 70], [220, 70]], 3: [[50, 60], [230, 60], [140, 160]] };

/** A read-only drawing of a Kripke model: worlds, arrows, and the letters true at each. */
export function kripkeDiagram(m, { world = null, logic = 'K' } = {}) {
  const n = m.worlds.length;
  const pos = Object.fromEntries(m.worlds.map((w, i) => [w, POS[Math.min(n, 3)][i] ?? [40 + i * 80, 60]]));
  const r = 22;
  const svg = s('svg', { viewBox: `0 0 280 ${n === 3 ? 210 : 130}`, class: 'kripke', role: 'img', 'aria-label': K.describe(m, logic) });
  const id = `ah${Math.random().toString(36).slice(2, 8)}`;
  svg.append(s('defs', {}, s('marker', { id, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' },
    s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'kripke-head' }))));
  for (const a of m.worlds) {
    for (const b of m.worlds) {
      if (!K.sees(m, a, b)) continue;
      const [x1, y1] = pos[a];
      if (a === b) {
        svg.append(s('path', { d: `M${x1 - 10},${y1 - r + 3} C${x1 - 30},${y1 - r - 38} ${x1 + 30},${y1 - r - 38} ${x1 + 10},${y1 - r + 3}`, class: 'kripke-edge', 'marker-end': `url(#${id})` }));
        continue;
      }
      const [x2, y2] = pos[b];
      const dx = x2 - x1; const dy = y2 - y1; const len = Math.hypot(dx, dy);
      const ux = dx / len; const uy = dy / len;
      const both = K.sees(m, b, a);
      const off = both ? 9 : 0;
      const sx = x1 + ux * r - uy * off; const sy = y1 + uy * r + ux * off;
      const ex = x2 - ux * (r + 2) - uy * off; const ey = y2 - uy * (r + 2) + ux * off;
      svg.append(s('line', { x1: sx, y1: sy, x2: ex, y2: ey, class: 'kripke-edge', 'marker-end': `url(#${id})` }));
    }
  }
  for (const w of m.worlds) {
    const [x, y] = pos[w];
    const letters = Object.keys(m.V).sort().filter((l) => m.V[l].has(w));
    svg.append(s('circle', { cx: x, cy: y, r, class: `kripke-world${String(world) === w ? ' here' : ''}` }));
    svg.append(s('text', { x, y: y + 5, 'text-anchor': 'middle', class: 'kripke-name' }, w));
    svg.append(s('text', { x, y: y + r + 17, 'text-anchor': 'middle', class: 'kripke-val' }, letters.length ? letters.join(' ') : '–'));
  }
  return svg;
}

const LOGIC_NOTE = {
  K: 'Any arrows are allowed.',
  T: 'In T every world must see itself.',
  S4: 'In S4 every world sees itself, and arrows chain: if 1 sees 2 and 2 sees 3, then 1 sees 3.',
  S5: 'In S5 the arrows form groups in which every world sees every world, itself included.',
  INT: 'Read an arrow as “can grow into”. Every world sees itself, arrows chain, and a letter true at a world stays true at every world it sees.',
};

function choiceBox(name, options, multi = false) {
  const inputs = [];
  const box = h('fieldset', { class: 'choices inline' }, h('legend', { class: 'small muted' }, 'Select one.'));
  options.forEach(([value, label]) => {
    const input = h('input', { type: multi ? 'checkbox' : 'radio', name, value });
    inputs.push(input);
    box.append(h('label', {}, input, h('span', {}, label)));
  });
  return {
    el: box,
    value: () => inputs.filter((i) => i.checked).map((i) => i.value),
    show: (ans) => inputs.forEach((i) => { i.checked = ans.includes(i.value); }),
  };
}

registerType('matrix', 'Three values', (ex) => {
  const logic = ex.logic;
  const L = MV.LOGICS[logic];
  const note = h('p', { class: 'small muted' }, `${L.name}. Values: T, F and ${L.third} (“${L.gloss}”). Designated (counts as true for validity): ${L.designated.map((x) => MV.label(logic, x)).join(' and ')}.`);
  if (ex.question === 'table') {
    const fs = ex.formulas.map((t) => parseFormula(t, { modal: true }).ast);
    const { letters, rows } = MV.table(logic, fs);
    const state = fs.map(() => rows.map(() => null));
    const buttons = fs.map(() => []);
    const cycle = [null, 1, 0.5, 0];
    const table = h('table', { class: 'tt' },
      h('thead', {}, h('tr', {}, letters.map((l) => h('th', { class: 'letters' }, l)), fs.map((f, j) => h('th', { class: j === 0 ? 'sep' : null }, formula(f))))),
      h('tbody', {}, rows.map((r, i) => h('tr', {},
        letters.map((l) => h('td', { class: `letters v${String(r.v[l]).replace('.', '')}` }, MV.label(logic, r.v[l]))),
        fs.map((f, j) => {
          const b = h('button', { type: 'button', 'aria-label': `Row ${i + 1}: blank` });
          const set = (v) => {
            state[j][i] = v;
            b.textContent = v == null ? '' : MV.label(logic, v);
            b.className = v == null ? '' : `filled v${String(v).replace('.', '')}`;
            b.setAttribute('aria-label', `Row ${i + 1}: ${v == null ? 'blank' : MV.label(logic, v)}`);
          };
          b.addEventListener('click', () => set(cycle[(cycle.indexOf(state[j][i]) + 1) % cycle.length]));
          b.addEventListener('keydown', (e) => {
            const k = e.key.toLowerCase();
            if (k === 't') { e.preventDefault(); set(1); }
            if (k === 'f') { e.preventDefault(); set(0); }
            if (['n', 'b', 'm', 'u', '½', '5'].includes(k)) { e.preventDefault(); set(0.5); }
          });
          b._set = set;
          buttons[j][i] = b;
          return h('td', { class: j === 0 ? 'sep' : null }, b);
        })))));
    return {
      el: [note, h('p', { class: 'small muted' }, `Click to cycle T, ${L.third}, F; or type T, F or ${L.third}.`), h('div', { class: 'tt-wrap' }, table)],
      value: () => state.map((c) => [...c]),
      show: (ans) => ans.forEach((col, j) => col.forEach((v, i) => buttons[j][i]._set(v))),
      mark: (res) => buttons.forEach((col, j) => col.forEach((b, i) => {
        b.classList.remove('good', 'wrong');
        if (res.cells?.[j]?.[i] === true) b.classList.add('good');
        if (res.cells?.[j]?.[i] === false) b.classList.add('wrong');
      })),
    };
  }
  const given = h('div', { class: 'given' }, formulaText(ex.argument));
  if (ex.question === 'validity') {
    const c = choiceBox(`m-${ex.id}`, [['valid', `valid in ${L.name}`], ['invalid', `invalid in ${L.name}`]]);
    return { el: [note, given, c.el], value: c.value, show: c.show };
  }
  const { premises, conclusion } = parseArgument(ex.argument, { modal: true });
  const letters = MV.lettersOf([...premises, conclusion]);
  const val = {};
  const valid = h('input', { type: 'checkbox', id: `mv-${ex.id}` });
  const groups = letters.map((l) => {
    const btns = [1, 0.5, 0].map((x) => h('button', { type: 'button', class: x === 1 ? 't' : x === 0 ? 'f' : 'u', 'aria-pressed': 'false', 'aria-label': `${l} ${MV.label(logic, x)}` }, MV.label(logic, x)));
    const set = (x) => { val[l] = x; btns.forEach((b, i) => b.setAttribute('aria-pressed', String([1, 0.5, 0][i] === x))); valid.checked = false; };
    btns.forEach((b, i) => b.addEventListener('click', () => set([1, 0.5, 0][i])));
    return { l, set, el: h('span', { class: 'tv' }, h('span', {}, l), btns) };
  });
  return {
    el: [note, given, h('div', { class: 'valuation' }, groups.map((g) => g.el)), h('label', { class: 'small', for: `mv-${ex.id}` }, valid, ' No such assignment: the argument is valid here')],
    value: () => (valid.checked ? { claimValid: true } : { valuation: { ...val } }),
    show: (ans) => { if (ans.claimValid) valid.checked = true; else groups.forEach((g) => g.set(ans.valuation[g.l])); },
  };
});

registerType('kripke', 'Worlds', (ex) => {
  const logic = ex.logic ?? 'K';
  const fname = K.FRAMES[logic].name;
  const note = h('p', { class: 'small muted' }, `Logic: ${fname}. ${LOGIC_NOTE[logic]}`);
  if (ex.question === 'evaluate') {
    const m = K.fromData(ex.model);
    const c = choiceBox(`k-${ex.id}`, [['true', 'true'], ['false', 'false']]);
    return {
      el: [note, h('div', { class: 'kripke-wrap' }, kripkeDiagram(m, { world: ex.world, logic })),
        h('p', {}, 'At world ', h('strong', {}, String(ex.world)), ', ', formulaText(ex.formula), ' is:'), c.el],
      value: c.value, show: c.show,
    };
  }
  const given = h('div', { class: 'given' }, formulaText(ex.argument));
  if (ex.question === 'validity') {
    const c = choiceBox(`k-${ex.id}`, [['valid', `valid in ${fname}`], ['invalid', `invalid in ${fname}`]]);
    return { el: [note, given, c.el], value: c.value, show: c.show };
  }
  // countermodel builder
  const { premises, conclusion } = parseArgument(ex.argument, { modal: true });
  const letters = MV.lettersOf([...premises, conclusion]);
  const state = { n: 2, R: new Set(), V: Object.fromEntries(letters.map((l) => [l, new Set()])), world: '1' };
  if (['T', 'S4', 'S5', 'INT'].includes(logic)) { state.R.add('1,1'); state.R.add('2,2'); }
  const holder = h('div', { class: 'model-builder' });
  const pic = h('div', { class: 'kripke-wrap' });
  const results = h('div', { class: 'model-results', 'aria-live': 'polite' });
  const ws = () => Array.from({ length: state.n }, (_, i) => String(i + 1));
  const data = () => ({ worlds: ws(), R: [...state.R].map((k) => k.split(',')).filter(([a, b]) => +a <= state.n && +b <= state.n), V: Object.fromEntries(Object.entries(state.V).map(([l, set]) => [l, [...set].filter((w) => +w <= state.n)])), world: state.world });
  const redrawPic = () => { clear(pic); pic.append(kripkeDiagram(K.fromData(data()), { world: state.world, logic })); };
  const draw = () => {
    clear(holder);
    holder.append(h('div', { class: 'model-row' }, h('span', { class: 'model-label' }, 'Worlds'),
      h('div', { class: 'segmented', role: 'group', 'aria-label': 'Number of worlds' }, [1, 2, 3].map((k) => h('button', {
        type: 'button', 'aria-pressed': String(k === state.n),
        onclick: () => { state.n = k; if (+state.world > k) state.world = '1'; draw(); },
      }, String(k))))));
    const grid = h('table', { class: 'tt model-table' },
      h('thead', {}, h('tr', {}, h('th', {}, 'sees →'), ws().map((b) => h('th', { scope: 'col' }, b)))),
      h('tbody', {}, ws().map((a) => h('tr', {}, h('th', { scope: 'row' }, a), ws().map((b) => {
        const box = h('input', { type: 'checkbox', 'aria-label': `World ${a} sees world ${b}`, checked: state.R.has(`${a},${b}`) ? true : null });
        box.addEventListener('change', () => { box.checked ? state.R.add(`${a},${b}`) : state.R.delete(`${a},${b}`); redrawPic(); });
        return h('td', {}, box);
      })))));
    holder.append(h('div', { class: 'model-row' }, h('span', { class: 'model-label' }, 'Arrows'), h('div', { class: 'tt-wrap' }, grid)));
    const vt = h('table', { class: 'tt model-table' },
      h('thead', {}, h('tr', {}, h('th', {}, ''), ws().map((w) => h('th', { scope: 'col' }, `world ${w}`)))),
      h('tbody', {}, letters.map((l) => h('tr', {}, h('th', { scope: 'row', class: 'f' }, l), ws().map((w) => {
        const box = h('input', { type: 'checkbox', 'aria-label': `${l} true at world ${w}`, checked: state.V[l].has(w) ? true : null });
        box.addEventListener('change', () => { box.checked ? state.V[l].add(w) : state.V[l].delete(w); redrawPic(); });
        return h('td', {}, box);
      })))));
    holder.append(h('div', { class: 'model-row' }, h('span', { class: 'model-label' }, 'True at'), h('div', { class: 'tt-wrap' }, vt)));
    const sel = h('select', { id: `kw-${ex.id}`, 'aria-label': 'World where the premises hold' }, ws().map((w) => h('option', { value: w, selected: w === state.world ? true : null }, `world ${w}`)));
    sel.addEventListener('change', () => { state.world = sel.value; redrawPic(); });
    holder.append(h('div', { class: 'model-row' }, h('span', { class: 'model-label' }, 'Evaluate at'), h('div', { class: 'model-names' }, sel)));
    redrawPic();
  };
  draw();
  return {
    el: [note, given, pic, holder, results],
    value: data,
    show: (ans) => {
      state.n = ans.worlds.length;
      state.R = new Set(ans.R.map(([a, b]) => `${a},${b}`));
      for (const l of letters) state.V[l] = new Set(ans.V[l] ?? []);
      state.world = String(ans.world);
      draw();
    },
    mark: (res) => {
      clear(results);
      if (!res.results) return;
      results.append(h('ul', { class: 'model-eval' }, res.results.map((r) => h('li', { class: r.value === r.want ? 'good' : 'bad' },
        h('span', { class: 'role' }, r.role === 'conclusion' ? 'Conclusion' : 'Premise'), formula(r.f),
        h('span', { class: `chip ${r.value ? 'ok' : 'shown'}` }, r.value ? 'true' : 'false')))));
    },
  };
});

registerType('deny', 'Which to give up?', (ex) => {
  const inputs = [];
  const box = h('fieldset', { class: 'choices' }, h('legend', { class: 'small muted' }, 'Choose one claim to give up.'));
  ex.premises.forEach((p, i) => {
    const input = h('input', { type: 'radio', name: `d-${ex.id}`, value: String(i) });
    inputs.push(input);
    box.append(h('label', {}, input, h('span', {}, ex.statements?.[i] ? [inline(ex.statements[i]), '  '] : null, formulaText(p))));
  });
  return {
    el: [dictionaryList(ex.dictionary), box],
    value: () => { const c = inputs.find((i) => i.checked); return c ? +c.value : null; },
    show: (ans) => inputs.forEach((i) => { i.checked = +i.value === ans; }),
  };
});

// --- Form and system (Langer) ----------------------------------------------------

function lawTable(ids) {
  return h('div', { class: 'ref-table-wrap' }, h('table', { class: 'ref laws' },
    h('thead', {}, h('tr', {}, h('th', {}, 'Law'), h('th', {}, 'Statement'))),
    h('tbody', {}, ids.map((id) => h('tr', {},
      h('td', { class: 'abbr' }, /^\d/.test(id) ? `Th. ${id}` : id),
      h('td', { class: 'f' }, AL.LAWS[id].statements.join('   ')))))));
}

function equationSpan(e) {
  return h('span', { class: 'f' }, AL.printEquation(e));
}

registerType('equational', 'Derive an equation', (ex, ctx) => {
  const laws = ex.laws ?? AL.POSTULATES;
  const goal = AL.parseEquation(ex.goal).eq;
  const editor = proofEditor({
    mode: ex.mode ?? 'full',
    given: ex.solution,
    set: 'algebra',
    parse: (t) => { const r = AL.parseEquation(t); return r.ok ? { ok: true, value: r.eq } : r; },
    tidy: AL.printEquation,
    layout: () => null,
    assumptions: false,
    head: h('div', { class: 'proof-row premise-last' }, h('span', { class: 'n' }, ''),
      h('span', { class: 'body' }, h('span', { class: 'static' }, h('span', { class: 'concl' }, 'Prove: ', equationSpan(goal)))), h('span', {}), h('span', {})),
    placeholders: { text: 'a = a × 1', just: 'IIb  or  3, V' },
    onEnterLast: () => ctx.check(),
  });
  return {
    el: [h('details', { class: 'laws-box' }, h('summary', {}, 'Laws you may cite'), lawTable(laws),
      h('p', { class: 'small muted' }, inline('Each line is an equation. Justify it by a law (**IIb**), by a line and a law (**3, V**: line 3 with one side rewritten once), by **Sym 3**, **Trans 3, 5**, or **Compl 3, 4** (from {!a + x = 1} and {!a × x = 0}, {!x = −a}).'))),
    editor.el],
    value: () => editor.value(),
    show: (ans) => (ex.mode === 'justify' ? editor.setJustifications(ans.map((l) => l.just)) : editor.setLines(ans)),
    mark: (res) => editor.mark(res.result),
    focus: () => editor.focus(),
  };
});

registerType('classeq', 'Class equation', (ex, ctx) => {
  const input = h('input', {
    type: 'text', id: `in-${ex.id}`, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
    'aria-label': 'Class equation', placeholder: 'e.g. s × −p = 0', 'aria-describedby': `in-${ex.id}-preview`,
  });
  const preview = h('div', { class: 'fin-preview', id: `in-${ex.id}-preview`, 'aria-live': 'polite' });
  const update = () => {
    clear(preview);
    preview.classList.remove('error');
    const t = input.value.trim();
    if (!t) return;
    const r = AL.parseEquation(t);
    if (r.ok) preview.append('Read as ', equationSpan(r.eq), ': ', formula(AL.classFormula(r.eq)));
    else { preview.classList.add('error'); preview.append(r.error.message); }
  };
  input.addEventListener('input', update);
  input.addEventListener('blur', () => { const r = AL.parseEquation(input.value.trim()); if (r.ok) input.value = AL.printEquation(r.eq); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); ctx.check(); } });
  const pal = palette('algebra', () => input);
  return {
    el: [dictionaryList(ex.dictionary), h('div', { class: 'fin' }, pal, input, preview)],
    value: () => input.value,
    show: (a) => { input.value = a; update(); },
    focus: () => input.focus(),
  };
});

function relationTable(s) {
  const rows = [];
  for (const [p, tuples] of Object.entries(s.relations ?? {})) {
    const gloss = s.glosses?.[p] ? ` (${s.glosses[p]})` : '';
    rows.push(h('li', {}, h('span', { class: 'f' }, p), gloss, ': ',
      tuples.length ? tuples.map((t) => [t].flat().join(' ')).join(', ') : 'nothing'));
  }
  const names = Object.entries(s.names ?? {});
  return h('div', { class: 'given structure' },
    h('p', {}, `Individuals: ${s.individuals.join(', ')}.`),
    names.length ? h('p', {}, `Names: ${names.map(([c, x]) => `${c} for ${x}`).join(', ')}.`) : null,
    h('ul', {}, rows));
}

function operationTables(alg) {
  const table = (title, cells) => h('table', { class: 'tt optable' },
    h('thead', {}, h('tr', {}, h('th', {}, title), alg.elements.map((e) => h('th', {}, e)))),
    h('tbody', {}, alg.elements.map((x, i) => h('tr', {}, h('th', {}, x), alg.elements.map((_, j) => h('td', {}, cells[i][j]))))));
  return h('div', { class: 'given structure' },
    h('p', {}, `Elements: ${alg.elements.join(', ')}. The element playing 0 is ${alg.zero}; the element playing 1 is ${alg.one}.`),
    h('div', { class: 'optables' }, table('+', alg.plus), table('×', alg.times),
      h('table', { class: 'tt optable' }, h('thead', {}, h('tr', {}, h('th', {}, 'a'), h('th', {}, '−a'))),
        h('tbody', {}, alg.elements.map((x, i) => h('tr', {}, h('th', {}, x), h('td', {}, alg.comp[i])))))));
}

registerType('structure', 'In this system', (ex) => {
  const multi = h('fieldset', { class: 'choices' });
  const inputs = [];
  if (ex.algebra) {
    multi.append(h('legend', { class: 'small muted' }, 'Select every postulate that fails.'));
    for (const id of [...AL.POSTULATES, 'VI']) {
      const input = h('input', { type: 'checkbox', value: id });
      inputs.push(input);
      const st = id === 'VI' ? 'there are at least two distinct elements' : AL.LAWS[id].statements.join(';  ');
      multi.append(h('label', {}, input, h('span', {}, h('strong', {}, id), '  ', h('span', { class: 'f' }, st))));
    }
  } else {
    multi.append(h('legend', { class: 'small muted' }, 'Select every statement that is true here.'));
    ex.statements.forEach((t, i) => {
      const input = h('input', { type: 'checkbox', value: String(i) });
      inputs.push(input);
      multi.append(h('label', {}, input, h('span', {}, formulaText(t))));
    });
  }
  return {
    el: [ex.algebra ? operationTables(ex.algebra) : relationTable(ex.structure), dictionaryList(ex.dictionary), multi],
    value: () => inputs.filter((i) => i.checked).map((i) => (ex.algebra ? i.value : +i.value)),
    show: (ans) => inputs.forEach((i) => { i.checked = ans.map(String).includes(i.value); }),
  };
});
