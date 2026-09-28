// Browser smoke test (not part of `npm test`; needs Playwright and Chromium).
//
//   npm run smoke
//
// Serves the site under /SymbolicLogic/ (as GitHub Pages does), then for every
// lesson: loads it, reveals and checks every exercise through the real UI,
// types a wrong translation, and checks the layout at phone width. Fails on
// console errors, failed or external requests, and horizontal page scroll.
// It also loads the site with localStorage throwing.

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { startServer } from './serve.js';
import { LESSONS } from '../src/course/index.js';

const require = createRequire(`${execSync('npm root -g').toString().trim()}/`);
const { chromium } = require('playwright');

const server = await startServer({ port: 0, prefix: '/SymbolicLogic' });
const { port } = server.address();
const origin = `http://localhost:${port}`;
const base = `${origin}/SymbolicLogic/`;
const failures = [];
const fail = (msg) => { failures.push(msg); console.error(`✗ ${msg}`); };

const browser = await chromium.launch();

function watch(page, label) {
  page.on('console', (m) => { if (m.type() === 'error') fail(`${label}: console error: ${m.text()}`); });
  page.on('pageerror', (e) => fail(`${label}: page error: ${e}`));
  page.on('requestfailed', (r) => fail(`${label}: request failed: ${r.url()}`));
  page.on('response', (r) => { if (r.status() >= 400) fail(`${label}: HTTP ${r.status()} ${r.url()}`); });
  page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) fail(`${label}: external request ${r.url()}`); });
}

// 1. Every exercise, revealed and checked.
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
watch(page, 'desktop');
let checked = 0;
for (const lesson of LESSONS) {
  await page.goto(`${base}#/lesson/${lesson.id}`);
  await page.waitForSelector('.lesson');
  for (const ex of lesson.exercises ?? []) {
    const card = page.locator(`#ex-${ex.id}`);
    await card.getByRole('button', { name: 'Show answer' }).click();
    await card.getByRole('button', { name: 'Check' }).click();
    const cls = await card.locator('.feedback').getAttribute('class');
    if (!cls?.includes('ok')) fail(`${lesson.id}/${ex.id}: revealed answer not accepted in the UI (${await card.locator('.feedback').innerText()})`);
    checked++;
  }
}
console.log(`✓ ${checked} exercises revealed and accepted through the UI`);

// 2. A wrong translation, typed in ASCII, gets a counterexample.
await page.goto(`${base}#/lesson/operators`);
await page.fill('#in-op-t2', 'L > D');
await page.press('#in-op-t2', 'Enter');
const fb = await page.locator('#ex-op-t2 .feedback').innerText();
if (!/Suppose/.test(fb)) fail(`wrong translation did not get a counterexample: ${fb}`);
else console.log('✓ wrong translation answered with a counterexample');

// 3. Deep links, reload, back and forward.
await page.goto(`${base}#/lesson/conditional-proof`);
await page.reload();
if (!(await page.locator('h1').innerText()).includes('Conditional proof')) fail('deep link or reload lost the lesson');
await page.goto(`${base}#/reference`);
await page.goBack();
if (!(await page.locator('h1').innerText()).includes('Conditional proof')) fail('back navigation failed');
console.log('✓ deep links, reload, back');

// 4. Phone width, dark mode: no horizontal page scroll.
const phone = await browser.newPage({ viewport: { width: 375, height: 800 }, colorScheme: 'dark' });
watch(phone, 'phone');
for (const route of ['', '#/sandbox', '#/reference', '#/sources', ...LESSONS.map((l) => `#/lesson/${l.id}`)]) {
  await phone.goto(base + route);
  await phone.waitForTimeout(50);
  const [sw, iw] = await phone.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  if (sw > iw) fail(`phone: ${route || 'home'} scrolls horizontally (${sw} > ${iw})`);
}
console.log('✓ phone layout');

// 4b. The same at phone width in Principia's dots, which print longer.
const dotsCtx = await browser.newContext({ viewport: { width: 375, height: 800 } });
await dotsCtx.addInitScript(() => {
  try { localStorage.setItem('symbolic-logic.v1', JSON.stringify({ version: 1, settings: { notation: 'principia' }, solved: {} })); } catch { /* ignore */ }
});
const dotsPage = await dotsCtx.newPage();
watch(dotsPage, 'principia');
for (const route of ['', '#/reference', ...LESSONS.map((l) => `#/lesson/${l.id}`)]) {
  await dotsPage.goto(base + route);
  await dotsPage.waitForTimeout(50);
  const [sw, iw] = await dotsPage.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  if (sw > iw) fail(`principia phone: ${route || 'home'} scrolls horizontally (${sw} > ${iw})`);
}
console.log('✓ phone layout in Principia notation');

// 4c. Switching notation redraws formulas and keeps typed work in Copi's symbols.
await page.goto(`${base}#/lesson/operators`);
await page.fill('#in-op-t10', 'B > (A . P)');
await page.click('#notation-principia');
const shown = await page.locator('#ex-op-t10 .fin-preview').innerText();
const typed = await page.inputValue('#in-op-t10');
if (!/B \. ⊃ \. A \. P/.test(shown)) fail(`Principia preview not redrawn: ${shown}`);
// Leaving the box tidies it into Copi's symbols, never into dots.
if (typed !== 'B ⊃ (A • P)') fail(`switching notation changed typed work: ${typed}`);
await page.click('#notation-copi');
console.log('✓ notation switch redraws and keeps typed work');

// 5. Storage that throws.
const ctx = await browser.newContext();
await ctx.addInitScript(() => {
  Object.defineProperty(window, 'localStorage', { get() { throw new Error('storage blocked'); } });
});
const locked = await ctx.newPage();
watch(locked, 'no-storage');
await locked.goto(`${base}#/lesson/truth-functions`);
await locked.waitForSelector('.lesson');
await locked.locator('#ex-tf-value-1').getByRole('button', { name: 'Show answer' }).click();
console.log('✓ runs with storage blocked');

// 6. Keyboard only: a translation, a truth table and a proof.
const kb = await browser.newPage({ viewport: { width: 1280, height: 900 } });
watch(kb, 'keyboard');
const okFeedback = async (sel, label) => {
  const cls = await kb.locator(`${sel} .feedback`).getAttribute('class');
  if (!cls?.includes('ok')) fail(`keyboard: ${label} not accepted (${await kb.locator(`${sel} .feedback`).innerText()})`);
};
await kb.goto(`${base}#/lesson/operators`);
await kb.focus('#in-op-t1');
await kb.keyboard.type('D . ~N');
await kb.keyboard.press('Enter');
await okFeedback('#ex-op-t1', 'typed translation');

await kb.goto(`${base}#/lesson/truth-functions`);
await kb.locator('#ex-tf-table-2 table.tt button').first().focus();
for (const key of ['t', 't', 'f', 't', 't', 'f', 't', 't']) {
  await kb.keyboard.press(key);
  await kb.keyboard.press('Tab');
}
await kb.keyboard.press('Enter'); // focus has moved to Check
await okFeedback('#ex-tf-table-2', 'truth table by keys');

await kb.goto(`${base}#/lesson/implication-rules`);
await kb.locator('#ex-ir-2 .proof-row input').first().focus();
await kb.keyboard.type('B v C');
await kb.keyboard.press('Enter');
await kb.keyboard.type('1, 2, MP');
await kb.keyboard.press('Enter');
await kb.keyboard.type('C');
await kb.keyboard.press('Enter');
await kb.keyboard.type('4, 3, DS');
await kb.locator('#ex-ir-2').getByRole('button', { name: 'Check' }).focus();
await kb.keyboard.press('Enter');
await okFeedback('#ex-ir-2', 'proof by keys');
console.log('✓ keyboard-only completion');

await browser.close();
server.close();
if (failures.length) {
  console.error(`\n${failures.length} problem(s).`);
  process.exit(1);
}
console.log('\nSmoke test passed.');
