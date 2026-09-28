// Citations from the bibliography.

import { h } from './dom.js';
import { BIB } from '../course/bibliography.js';

export function cite(id) {
  const b = BIB[id];
  if (!b) return h('span', { class: 'cite muted' }, `[missing source: ${id}]`);
  const parts = [];
  parts.push(`${b.author}${b.year ? ` (${b.year})` : ''}. `);
  if (b.kind === 'book' || b.kind === 'ancient') {
    parts.push(h('span', { class: 'title' }, b.title));
    if (b.detail) parts.push(`, ${b.detail}`);
    parts.push(b.detail?.endsWith('.') ? ' ' : '. ');
  } else {
    parts.push(h('span', { class: 'article' }, `“${b.title}.” `));
    if (b.container) parts.push(h('span', { class: 'title' }, b.container));
    if (b.detail) parts.push(` ${b.detail}`);
    parts.push(b.detail?.endsWith('.') ? ' ' : '. ');
  }
  if (b.publisher) parts.push(`${b.publisher}. `);
  if (b.note) parts.push(`${b.note} `);
  const out = h('span', { class: 'cite' }, parts);
  if (b.url) out.append(h('a', { href: b.url, target: '_blank', rel: 'noopener', class: 'open' }, b.urlLabel ?? 'Read online'));
  return out;
}
