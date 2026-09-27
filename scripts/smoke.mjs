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

await browser.close();
server.close();
if (failures.length) {
  console.error(`\n${failures.length} problem(s).`);
  process.exit(1);
}
console.log('\nSmoke test passed.');
