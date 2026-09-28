// Router and page chrome.

import { h, clear, redrawFormulas } from './dom.js';
import { redrawPalettes } from './formula-input.js';
import { settings, lessonProgress } from './state.js';
import { PARTS, LESSONS } from '../course/index.js';
import { renderLesson } from './lesson.js';
import { renderHome, renderSandbox, renderReference, renderSources } from './pages.js';
import './exercise-types.js';

const main = document.getElementById('main');
const nav = document.getElementById('course-map');
const menuBtn = document.getElementById('menu-btn');

function parseRoute() {
  const hash = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [kind, id] = hash.split('/');
  return { kind: kind || 'home', id };
}

function renderNav(route) {
  clear(nav);
  for (const part of PARTS) {
    nav.append(h('h2', {}, `Part ${part.numeral} · ${part.title}`));
    nav.append(h('ol', {}, part.lessons.map((l) => {
      const p = lessonProgress(l);
      const current = route.kind === 'lesson' && route.id === l.id;
      return h('li', {}, h('a', { href: `#/lesson/${l.id}`, 'aria-current': current ? 'page' : null },
        h('span', { class: 'num' }, String(l.number)),
        h('span', {}, l.title),
        p.total ? h('span', { class: `done${p.solved < p.total ? ' partial' : ''}`, 'aria-label': `${p.solved} of ${p.total} solved` }, `${p.solved}/${p.total}`) : h('span', {})));
    })));
  }
  nav.append(h('h2', {}, 'Tools'));
  nav.append(h('ul', { class: 'tools' }, [['sandbox', 'Sandbox'], ['reference', 'Reference'], ['sources', 'Sources']].map(([k, label]) =>
    h('li', {}, h('a', { href: `#/${k}`, 'aria-current': route.kind === k ? 'page' : null }, h('span', {}, label))))));
}

function render({ keepScroll = false } = {}) {
  const route = parseRoute();
  const y = window.scrollY;
  clear(main);
  let title = 'Symbolic Logic';
  if (route.kind === 'lesson') {
    const i = LESSONS.findIndex((l) => l.id === route.id);
    if (i < 0) {
      main.append(h('div', { class: 'tool-page' }, h('h1', {}, 'No such lesson'), h('p', {}, h('a', { href: '#/' }, 'Back to the contents'))));
    } else {
      const lesson = LESSONS[i];
      const part = PARTS.find((p) => p.lessons.includes(lesson));
      main.append(renderLesson(lesson, { part, prev: LESSONS[i - 1], next: LESSONS[i + 1] }));
      title = `${lesson.title} · Symbolic Logic`;
    }
  } else if (route.kind === 'sandbox') {
    main.append(renderSandbox()); title = 'Sandbox · Symbolic Logic';
  } else if (route.kind === 'reference') {
    main.append(renderReference()); title = 'Reference · Symbolic Logic';
  } else if (route.kind === 'sources') {
    main.append(renderSources(LESSONS)); title = 'Sources · Symbolic Logic';
  } else {
    main.append(renderHome(PARTS));
  }
  document.title = title;
  renderNav(route);
  nav.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  if (keepScroll) window.scrollTo(0, y);
  else { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
}

function paintNotation() {
  for (const n of ['copi', 'principia', 'modern']) {
    document.getElementById(`notation-${n}`).setAttribute('aria-pressed', String(settings.notation === n));
  }
}

for (const n of ['copi', 'principia', 'modern']) {
  document.getElementById(`notation-${n}`).addEventListener('click', () => {
    if (settings.notation === n) return;
    settings.notation = n;
    paintNotation();
    redrawFormulas();
    redrawPalettes();
    window.dispatchEvent(new Event('notationchange'));
  });
}

menuBtn.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
});

// Progress counts in the contents refresh when an exercise is solved.
document.addEventListener('click', (e) => {
  if (e.target.closest?.('.exercise .btn')) setTimeout(() => renderNav(parseRoute()), 0);
});

window.addEventListener('hashchange', () => render());
paintNotation();
render();
