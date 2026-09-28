// The proof editor: numbered lines, a formula and a justification on each,
// with Hurley's vertical scope lines drawn from the block structure that the
// checker derives from ACP/AIP and CP/IP. Students never indent by hand.

import { h, clear, formula } from './dom.js';
import { palette } from './formula-input.js';
import { parseFormula } from '../logic/parser.js';
import { print } from '../logic/printer.js';
import { checkProof } from '../logic/proof.js';
import { settings } from './state.js';

let uid = 0;

/**
 * premises, conclusion: ASTs.
 * mode: 'full' (write every line), 'justify' (formulas given, supply
 *   justifications), 'fill' (some formulas blank).
 * given: for 'justify' and 'fill', the reference lines [[text, just], ...];
 * blanks: for 'fill', indexes of lines whose formula is left blank.
 */
export function proofEditor({ premises, conclusion, mode = 'full', given = [], blanks = [], set = 'sentential', onEnterLast }) {
  const id = `pf${++uid}`;
  let lastFocused = null;
  let rows = [];
  const root = h('div', { class: 'proof', role: 'group', 'aria-label': 'Proof' });
  const premiseBox = h('div', {});
  const body = h('div', {});

  premises.forEach((p, i) => {
    const last = i === premises.length - 1;
    premiseBox.append(h('div', { class: `proof-row${last ? ' premise-last' : ''}` },
      h('span', { class: 'n' }, `${i + 1}.`),
      h('span', { class: 'body' }, h('span', { class: 'static' }, formula(p), last ? h('span', { class: 'concl' }, '/∴ ', formula(conclusion)) : null)),
      h('span', { class: 'just-static' }, ''),
      h('span', {})));
  });
  if (!premises.length) {
    premiseBox.append(h('div', { class: 'proof-row premise-last' },
      h('span', { class: 'n' }, ''),
      h('span', { class: 'body' }, h('span', { class: 'static' }, h('span', { class: 'concl' }, '/∴ ', formula(conclusion)))),
      h('span', {}), h('span', {})));
  }

  const lineNo = (i) => premises.length + i + 1;

  function makeRow(line = {}, fixed = {}) {
    const k = ++uid;
    const text = h('input', {
      type: 'text', id: `${id}-f${k}`, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
      'aria-label': 'Formula', value: line.text ?? '', readonly: fixed.text ? true : null,
      placeholder: fixed.text ? null : 'formula',
    });
    const just = h('input', {
      type: 'text', id: `${id}-j${k}`, class: 'just', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
      'aria-label': 'Justification', value: line.just ?? '', readonly: fixed.just ? true : null,
      placeholder: fixed.just ? null : '1, 2, MP',
    });
    const scope = h('span', { class: 'scope', 'aria-hidden': 'true' });
    const n = h('span', { class: 'n' });
    const del = h('button', { type: 'button', class: 'del', 'aria-label': 'Delete line', title: 'Delete line' }, '×');
    const msg = h('div', { class: 'proof-msg', hidden: true });
    const el = h('div', { class: 'proof-row' }, n, h('span', { class: 'body' }, scope, text), h('span', { class: 'just-cell' }, just), mode === 'full' ? del : h('span', {}));
    const row = { el, text, just, scope, n, msg, fixed };

    text.addEventListener('focus', () => { lastFocused = text; });
    text.addEventListener('input', () => { clearMark(row); relayout(); });
    just.addEventListener('input', () => { clearMark(row); relayout(); });
    text.addEventListener('blur', () => {
      const r = parseFormula(text.value.trim());
      if (r.ok) text.value = print(r.ast, { notation: settings.inputNotation });
    });
    text.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); if (!just.readOnly) just.focus(); else nextFrom(row); }
    });
    just.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); nextFrom(row); }
    });
    del.addEventListener('click', () => {
      const i = rows.indexOf(row);
      rows.splice(i, 1);
      row.el.remove();
      row.msg.remove();
      if (!rows.length) addRow();
      renumber();
      relayout();
      (rows[Math.max(0, i - 1)]?.text ?? null)?.focus();
    });
    return row;
  }

  function nextFrom(row) {
    const i = rows.indexOf(row);
    if (i < rows.length - 1) { rows[i + 1].text.readOnly ? rows[i + 1].just.focus() : rows[i + 1].text.focus(); return; }
    if (mode === 'full') { addRow({}, i + 1).text.focus(); return; }
    onEnterLast?.();
  }

  function addRow(line = {}, at = rows.length) {
    const row = makeRow(line);
    rows.splice(at, 0, row);
    const before = rows[at + 1];
    if (before) { body.insertBefore(row.el, before.el); body.insertBefore(row.msg, before.el); }
    else { body.append(row.el, row.msg); }
    renumber();
    relayout();
    return row;
  }

  function renumber() {
    rows.forEach((r, i) => { r.n.textContent = `${lineNo(i)}.`; });
  }

  function value() {
    return rows.map((r) => ({ text: r.text.value.trim(), just: r.just.value.trim() }))
      .filter((l, i, all) => l.text || l.just || i < all.length - 1 || mode !== 'full');
  }

  // Scope lines follow the structure the checker derives, live.
  function relayout() {
    const lines = rows.map((r) => ({ text: r.text.value.trim(), just: r.just.value.trim() }));
    const res = checkProof({ premises, conclusion, lines });
    rows.forEach((r, i) => r.scope.style.setProperty('--depth', res.lines[premises.length + i]?.depth ?? 0));
  }

  function clearMark(row) {
    row.el.classList.remove('bad', 'good');
    row.msg.hidden = true;
    clear(row.msg);
  }

  function mark(result) {
    const trailingBlank = rows.length > value().length;
    rows.forEach((r, i) => {
      clearMark(r);
      const info = result.lines[premises.length + i];
      if (!info || (trailingBlank && i === rows.length - 1)) return;
      if (!info.ok) {
        r.el.classList.add('bad');
        r.msg.className = 'proof-msg';
        r.msg.textContent = info.errors.join(' ');
        r.msg.hidden = false;
      } else if (info.dependsOn) {
        r.msg.className = 'proof-msg dep';
        r.msg.textContent = `This line checks, but it rests on line ${info.dependsOn}, which does not.`;
        r.msg.hidden = false;
      } else {
        r.el.classList.add('good');
      }
    });
  }

  function setLines(lines) {
    for (const r of rows) { r.el.remove(); r.msg.remove(); }
    rows = [];
    lines.forEach((l) => addRow(l));
    if (!rows.length) addRow();
    relayout();
  }

  if (mode === 'justify') {
    given.forEach(([text]) => {
      const row = makeRow({ text }, { text: true });
      rows.push(row);
      body.append(row.el, row.msg);
    });
  } else if (mode === 'fill') {
    given.forEach(([text, just], i) => {
      const blank = blanks.includes(i);
      const row = makeRow({ text: blank ? '' : text, just }, { text: !blank, just: true });
      rows.push(row);
      body.append(row.el, row.msg);
    });
  } else {
    addRow();
  }
  renumber();
  relayout();

  const tools = h('div', { class: 'proof-tools' });
  const pal = palette(set, () => lastFocused ?? rows.find((r) => !r.text.readOnly)?.text);
  tools.append(pal);
  if (mode === 'full') {
    const add = (just) => () => {
      const row = addRow({ just });
      row.text.focus();
    };
    tools.append(
      h('span', { class: 'sep', 'aria-hidden': 'true' }),
      h('button', { type: 'button', class: 'btn quiet', onclick: add('') }, '+ Line'),
      h('button', { type: 'button', class: 'btn quiet', onclick: add('ACP'), title: 'Assume a formula for conditional proof' }, '+ Assumption (C.P.)'),
      h('button', { type: 'button', class: 'btn quiet', onclick: add('AIP'), title: 'Assume a formula for indirect proof' }, '+ Assumption (I.P.)'),
    );
  }

  root.append(premiseBox, body, tools);
  return {
    el: root,
    value,
    mark,
    setLines,
    setJustifications(justs) { rows.forEach((r, i) => { r.just.value = justs[i] ?? ''; }); relayout(); },
    setFormulas(texts) { rows.forEach((r, i) => { if (!r.text.readOnly) r.text.value = texts[i] ?? ''; }); relayout(); },
    focus() { (rows.find((r) => !r.text.readOnly)?.text ?? rows[0]?.just)?.focus(); },
  };
}
