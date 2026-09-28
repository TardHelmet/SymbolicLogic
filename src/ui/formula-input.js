// A text box for formulas. Students type ASCII or glyphs; the box is never
// rewritten while they type. A preview underneath shows how the input was
// read (or why it can't be), and on leaving the box the text is tidied into
// the current notation.

import { h, clear, formula } from './dom.js';
import { parseFormula } from '../logic/parser.js';
import { print } from '../logic/printer.js';
import { settings } from './state.js';

const SETS = {
  sentential: ['~', '•', '∨', '⊃', '≡', '(', ')', '[', ']'],
  predicate: ['~', '•', '∨', '⊃', '≡', '(', ')', '[', ']', '(x)', '(∃x)', '='],
  modal: ['~', '•', '∨', '⊃', '≡', '(', ')', '□', '◇'],
};

const MODERN = { '~': '¬', '•': '∧', '⊃': '→', '≡': '↔', '(x)': '∀x', '(∃x)': '∃x' };
const NAMES = {
  '~': 'tilde (not)', '•': 'dot (and)', '∨': 'wedge (or)', '⊃': 'horseshoe (if…then)', '≡': 'triple bar (if and only if)',
  '(x)': 'universal quantifier', '(∃x)': 'existential quantifier', '=': 'identity', '□': 'box (necessarily)', '◇': 'diamond (possibly)',
  '(': 'open bracket', ')': 'close bracket', '[': 'open square bracket', ']': 'close square bracket',
};
const SPACED = new Set(['•', '∨', '⊃', '≡', '=']);

export function insertAtCaret(input, text) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  const before = input.value.slice(0, start);
  const pad = SPACED.has(text.trim()) ? ` ${text.trim()} ` : text;
  const piece = SPACED.has(text.trim()) && /\s$/.test(before) ? pad.trimStart() : pad;
  input.setRangeText(piece, start, end, 'end');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.focus();
}

/** A row of symbol buttons. target() returns the input to insert into. */
export function palette(set, target) {
  const bar = h('div', { class: 'palette', role: 'toolbar', 'aria-label': 'Symbols' });
  for (const sym of SETS[set] ?? SETS.sentential) {
    const shown = glyphFor(sym);
    const btn = h('button', {
      type: 'button',
      'data-sym': sym,
      'aria-label': `Insert ${NAMES[sym] ?? sym}`,
      onmousedown: (e) => e.preventDefault(),
      onclick: () => { const t = target(); if (t) insertAtCaret(t, glyphFor(sym)); },
    }, shown);
    bar.append(btn);
  }
  return bar;
}

const glyphFor = (sym) => (settings.inputNotation === 'modern' ? MODERN[sym] ?? sym : sym);

export function redrawPalettes(root = document) {
  for (const b of root.querySelectorAll('.palette button[data-sym]')) b.textContent = glyphFor(b.dataset.sym);
}

export function formulaInput({ id, label = 'Your formula', set = 'sentential', placeholder, onEnter, parseOpts = {} }) {
  const input = h('input', {
    id, type: 'text', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false',
    'aria-label': label, 'aria-describedby': `${id}-preview`,
    placeholder: placeholder ?? (set === 'predicate' ? 'e.g. (x)(Fx > Gx)' : 'e.g. (A . B) > ~C'),
  });
  const preview = h('div', { class: 'fin-preview', id: `${id}-preview`, 'aria-live': 'polite' });

  const update = () => {
    clear(preview);
    preview.classList.remove('error');
    const text = input.value.trim();
    if (!text) return;
    const r = parseFormula(text, { modal: set === 'modal', ...parseOpts });
    if (r.ok) {
      preview.append('Read as ', formula(r.ast));
    } else {
      preview.classList.add('error');
      preview.append(r.error.message, r.error.hint ? ` ${r.error.hint}` : '');
    }
  };
  input.addEventListener('input', update);
  input.addEventListener('blur', () => {
    const r = parseFormula(input.value.trim(), { modal: set === 'modal', ...parseOpts });
    if (r.ok) input.value = print(r.ast, { notation: settings.inputNotation });
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); onEnter?.(); }
  });

  const el = h('div', { class: 'fin' }, palette(set, () => input), input, preview);
  return {
    el,
    input,
    get value() { return input.value; },
    set value(v) { input.value = v ?? ''; update(); },
    focus() { input.focus(); },
  };
}
