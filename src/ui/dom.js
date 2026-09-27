// DOM helpers. All text goes in through textContent or text nodes; no HTML
// string is ever parsed, so nothing a student types can become markup.

import { parseAny, inlineFormulas } from '../course/markup.js';
import { printTokens, speak } from '../logic/printer.js';
import { settings } from './state.js';

export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k === 'value') el.value = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  append(el, children);
  return el;
}

export function append(el, children) {
  for (const c of [children].flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function clear(el) {
  while (el.firstChild) el.firstChild.remove();
  return el;
}

// --- formulas ------------------------------------------------------------

function fillTokens(span, ast, notation) {
  clear(span);
  for (const t of printTokens(ast, { notation })) {
    span.append(t.meta ? h('i', {}, t.s) : document.createTextNode(t.s));
  }
}

// Spans remember their formula so a notation switch can redraw them in place,
// without disturbing anything a student has typed.
const LIVE = new WeakMap();

function tokenSpan(ast, notation) {
  const span = h('span', { class: 'f', role: 'math', 'aria-label': speak(ast), 'data-live': '' });
  LIVE.set(span, ast);
  fillTokens(span, ast, notation);
  return span;
}

export function redrawFormulas(root = document) {
  for (const span of root.querySelectorAll('[data-live]')) {
    const ast = LIVE.get(span);
    if (ast) fillTokens(span, ast, settings.notation);
  }
}

/** A formula (AST) as a styled span in the current notation. */
export function formula(ast) {
  return tokenSpan(ast, settings.notation);
}

/** Render content-supplied formula text; falls back to the raw text. */
export function formulaText(src) {
  const r = parseAny(src);
  if (!r) return h('span', { class: 'f' }, src);
  if (r.ast) return formula(r.ast);
  const span = h('span', { class: 'f' });
  r.premises.forEach((p, i) => {
    if (i) span.append(', ');
    span.append(tokenSpan(p, settings.notation));
  });
  span.append(r.premises.length ? ' / ' : '/ ', tokenSpan(r.conclusion, settings.notation));
  return span;
}

// --- inline markup ---------------------------------------------------------
// {formula}  {!raw symbols, not parsed}  **strong**  *emphasis*  [label](https://…)

const INLINE = /\{([^}]+)\}|\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\((https?:[^)\s]+|#[^)\s]*)\)/;

export function inline(text) {
  const frag = document.createDocumentFragment();
  if (text == null) return frag;
  // A fresh regex per call: inline() recurses for **…** and *…*.
  const re = new RegExp(INLINE.source, 'g');
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) frag.append(text.slice(last, m.index));
    if (m[1] !== undefined) frag.append(m[1].startsWith('!') ? h('span', { class: 'f' }, m[1].slice(1)) : formulaText(m[1]));
    else if (m[2] !== undefined) frag.append(h('strong', {}, inline(m[2])));
    else if (m[3] !== undefined) frag.append(h('em', {}, inline(m[3])));
    else {
      const external = m[5].startsWith('http');
      frag.append(h('a', { href: m[5], target: external ? '_blank' : null, rel: external ? 'noopener' : null }, m[4]));
    }
    last = re.lastIndex;
  }
  if (last < text.length) frag.append(text.slice(last));
  return frag;
}

export { parseAny, inlineFormulas };
