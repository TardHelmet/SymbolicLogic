// Colour contrast of the theme tokens (WCAG 2.x relative luminance). Every
// text/background pair the stylesheet uses must reach 4.5:1 in both themes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

function tokens(block) {
  const out = {};
  for (const m of block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)) out[m[1]] = m[2];
  return out;
}

const light = tokens(css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {'))));
const darkStart = css.indexOf(':root[data-theme="dark"]');
const dark = tokens(css.slice(darkStart, css.indexOf('}', darkStart)));

function lum(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const PAIRS = [
  ['ink', 'paper'], ['ink', 'sheet'], ['ink-2', 'sheet'], ['ink-2', 'paper'], ['ink-3', 'sheet'], ['ink-3', 'paper'],
  ['accent', 'sheet'], ['accent', 'paper'], ['accent', 'accent-soft'], ['accent-ink', 'accent'],
  ['true', 'true-bg'], ['true', 'sheet'], ['false', 'false-bg'], ['false', 'sheet'], ['warn', 'warn-bg'], ['warn', 'sheet'],
  ['note', 'note-bg'], ['ink', 'note-bg'], ['ink', 'accent-soft'], ['ink', 'true-bg'], ['ink', 'false-bg'],
];

for (const [name, theme] of [['light', light], ['dark', dark]]) {
  test(`text contrast in the ${name} theme`, () => {
    for (const [fg, bg] of PAIRS) {
      assert.ok(theme[fg] && theme[bg], `${name}: missing token ${fg} or ${bg}`);
      const r = ratio(theme[fg], theme[bg]);
      assert.ok(r >= 4.5, `${name}: --${fg} on --${bg} is ${r.toFixed(2)}:1, below 4.5:1`);
    }
  });
}
