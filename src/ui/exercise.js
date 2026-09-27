// Exercise cards. Each type mounts a small widget with value(), show(answer)
// and mark(result); marking itself always goes through checkAnswer.

import { h, clear, inline, formula, formulaText } from './dom.js';
import { formulaInput } from './formula-input.js';
import { proofEditor } from './proof-editor.js';
import { checkAnswer, modelAnswer, CLASSIFY_OPTIONS, formulasOf, argumentOf } from '../logic/check.js';
import { parseFormula } from '../logic/parser.js';
import { printTokens, print } from '../logic/printer.js';
import { truthTable, columns, lettersIn } from '../logic/semantics.js';
import { hints } from '../logic/proof.js';
import * as A from '../logic/ast.js';
import { settings, markSolved, markRevealed, solvedState } from './state.js';

const LABEL = {
  translate: 'Symbolize', readings: 'Two readings', 'truth-table': 'Truth table', classify: 'Classify',
  'main-operator': 'Main operator', choice: 'Question', counterexample: 'Counterexample', proof: 'Proof',
  enthymeme: 'Missing premise',
};

export const MOUNTS = {};
export function registerType(type, label, mount) {
  LABEL[type] = label;
  MOUNTS[type] = mount;
}

function setFor(ex, text) {
  if (ex.set) return ex.set;
  if (ex.modal) return 'modal';
  return /[(]\s*[xyz]\s*[)]|∃|[A-Z][a-z]|=/.test(text ?? '') ? 'predicate' : 'sentential';
}

function dictionaryList(dict) {
  if (!dict || !Object.keys(dict).length) return null;
  return h('ul', { class: 'dictionary', 'aria-label': 'Dictionary' },
    Object.entries(dict).map(([k, v]) => h('li', {}, h('span', { class: 'f' }, k), inline(v))));
}

function givenLine(content) {
  return h('div', { class: 'given' }, content);
}

// --- types -------------------------------------------------------------------

MOUNTS.translate = (ex, ctx) => {
  const fin = formulaInput({ id: `in-${ex.id}`, set: setFor(ex, ex.key), onEnter: () => ctx.check() });
  return {
    el: [dictionaryList(ex.dictionary), fin.el],
    value: () => fin.value,
    show: (a) => { fin.value = print(parseFormula(a, { modal: !!ex.modal }).ast, { notation: settings.notation }); },
    focus: () => fin.focus(),
  };
};

MOUNTS.enthymeme = (ex, ctx) => {
  const fin = formulaInput({ id: `in-${ex.id}`, label: 'Missing premise', set: setFor(ex, ex.argument), onEnter: () => ctx.check() });
  return {
    el: [dictionaryList(ex.dictionary), givenLine(formulaText(ex.argument)), fin.el],
    value: () => fin.value,
    show: (a) => { fin.value = print(parseFormula(a, { modal: !!ex.modal }).ast, { notation: settings.notation }); },
  };
};

MOUNTS.readings = (ex, ctx) => {
  const a = formulaInput({ id: `in-${ex.id}-1`, label: 'First reading', set: setFor(ex, ex.keys[0]), onEnter: () => ctx.check() });
  const b = formulaInput({ id: `in-${ex.id}-2`, label: 'Second reading', set: setFor(ex, ex.keys[1]), onEnter: () => ctx.check() });
  return {
    el: [dictionaryList(ex.dictionary), h('p', { class: 'small muted' }, 'First reading'), a.el, h('p', { class: 'small muted' }, 'Second reading'), b.el],
    value: () => [a.value, b.value],
    show: (ans) => { a.value = ans[0]; b.value = ans[1]; },
  };
};

MOUNTS['truth-table'] = (ex) => {
  const fs = formulasOf(ex);
  const cols = ex.columns === 'all' ? fs.flatMap((f) => columns(f)) : fs;
  const { letters, rows } = truthTable(cols);
  const state = cols.map(() => rows.map(() => ''));
  const buttons = cols.map(() => []);
  const mainSet = new Set(fs.map((f) => A.key(f)));
  const table = h('table', { class: 'tt' });
  const head = h('tr', {},
    letters.map((l, i) => h('th', { scope: 'col', class: `letters${i === letters.length - 1 ? '' : ''}` }, l)),
    cols.map((c, j) => h('th', { scope: 'col', class: j === 0 ? 'sep' : null }, formula(c))));
  table.append(h('thead', {}, head));
  const tbody = h('tbody');
  rows.forEach((r, i) => {
    const tr = h('tr', {}, letters.map((l) => h('td', { class: `letters ${r.v[l] ? 'T' : 'F'}` }, r.v[l] ? 'T' : 'F')));
    cols.forEach((c, j) => {
      const b = h('button', { type: 'button', 'aria-label': `Row ${i + 1}, ${print(c)}: blank` });
      const set = (v) => {
        state[j][i] = v;
        b.textContent = v;
        b.className = v ? `filled ${v}` : '';
        b.setAttribute('aria-label', `Row ${i + 1}, ${print(c)}: ${v || 'blank'}`);
      };
      b.addEventListener('click', () => set(state[j][i] === '' ? 'T' : state[j][i] === 'T' ? 'F' : ''));
      b.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        if (k === 't' || k === '1') { e.preventDefault(); set('T'); }
        if (k === 'f' || k === '0') { e.preventDefault(); set('F'); }
        if (k === 'backspace' || k === 'delete') { e.preventDefault(); set(''); }
      });
      b._set = set;
      buttons[j][i] = b;
      tr.append(h('td', { class: [j === 0 ? 'sep' : '', mainSet.has(A.key(c)) ? 'main' : ''].join(' ').trim() || null }, b));
    });
    tbody.append(tr);
  });
  table.append(tbody);
  return {
    el: [h('p', { class: 'small muted' }, 'Click a cell to cycle T, F, blank, or type T or F.'), h('div', { class: 'tt-wrap' }, table)],
    value: () => state.map((c) => [...c]),
    show: (ans) => ans.forEach((col, j) => col.forEach((v, i) => buttons[j][i]._set(v))),
    mark: (res) => {
      buttons.forEach((col, j) => col.forEach((b, i) => {
        b.classList.remove('good', 'wrong');
        const c = res.cells?.[j]?.[i];
        if (c === true) b.classList.add('good');
        if (c === false) b.classList.add('wrong');
      }));
    },
  };
};

MOUNTS.classify = (ex) => {
  let given;
  const assume = ex.given?.length ? h('p', { class: 'small muted' }, 'Assume: ', ex.given.map((g, i) => [i ? ', ' : '', formulaText(g)])) : null;
  if (ex.mode === 'argument') given = givenLine(formulaText(ex.argument));
  else given = givenLine(formulasOf(ex).flatMap((f, i) => (i ? [h('span', { class: 'muted' }, ex.mode === 'pair' || ex.mode === 'opposition' ? '   and   ' : ',   '), formula(f)] : [formula(f)])));
  const multi = ex.mode === 'pair';
  const opts = CLASSIFY_OPTIONS[ex.mode];
  const inputs = [];
  const box = h('fieldset', { class: `choices${ex.mode === 'opposition' ? '' : ' inline'}` }, h('legend', { class: 'small muted' }, multi ? 'Select all that apply.' : 'Select one.'));
  opts.forEach((o) => {
    const input = h('input', { type: multi ? 'checkbox' : 'radio', name: `c-${ex.id}`, value: o });
    inputs.push(input);
    box.append(h('label', {}, input, h('span', {}, o)));
  });
  return {
    el: [dictionaryList(ex.dictionary), given, assume, box],
    value: () => inputs.filter((i) => i.checked).map((i) => i.value),
    show: (ans) => inputs.forEach((i) => { i.checked = ans.includes(i.value); }),
    mark: (res) => inputs.forEach((i) => {
      const lab = i.parentElement;
      lab.classList.remove('mark-ok', 'mark-bad');
      if (res.ok && i.checked) lab.classList.add('mark-ok');
      if (!res.ok && i.checked && !res.answer?.includes(i.value)) lab.classList.add('mark-bad');
    }),
  };
};

MOUNTS['main-operator'] = (ex) => {
  const ast = parseFormula(ex.formula).ast;
  let chosen;
  const wrap = h('div', { class: 'tokens' });
  const none = h('button', { type: 'button', class: 'btn quiet', 'aria-pressed': 'false' }, 'No operator: it is atomic');
  const draw = () => {
    clear(wrap);
    for (const t of printTokens(ast, { notation: settings.notation })) {
      if (!t.op) { wrap.append(t.s); continue; }
      const b = h('button', { type: 'button', 'aria-pressed': String(JSON.stringify(chosen) === JSON.stringify(t.path)), 'aria-label': `Operator ${t.s.trim()}` }, t.s);
      b.addEventListener('click', () => { chosen = t.path; none.setAttribute('aria-pressed', 'false'); draw(); });
      wrap.append(b);
    }
  };
  none.addEventListener('click', () => { chosen = null; none.setAttribute('aria-pressed', 'true'); draw(); });
  draw();
  const onNotation = () => (wrap.isConnected ? draw() : window.removeEventListener('notationchange', onNotation));
  window.addEventListener('notationchange', onNotation);
  return {
    el: [h('p', { class: 'small muted' }, 'Click the main operator.'), wrap, none],
    value: () => chosen,
    show: (ans) => { chosen = ans; none.setAttribute('aria-pressed', String(ans === null)); draw(); },
  };
};

MOUNTS.choice = (ex) => {
  const multi = Array.isArray(ex.answer);
  const inputs = [];
  const box = h('fieldset', { class: 'choices' }, h('legend', { class: 'small muted' }, multi ? 'Select all that apply.' : 'Select one.'));
  ex.options.forEach((o, i) => {
    const input = h('input', { type: multi ? 'checkbox' : 'radio', name: `c-${ex.id}`, value: String(i) });
    inputs.push(input);
    box.append(h('label', {}, input, h('span', {}, inline(o))));
  });
  return {
    el: [ex.given ? givenLine(formulaText(ex.given)) : null, box],
    value: () => inputs.filter((i) => i.checked).map((i) => +i.value),
    show: (ans) => inputs.forEach((i) => { i.checked = ans.includes(+i.value); }),
    mark: (res) => {
      const answer = Array.isArray(ex.answer) ? ex.answer : [ex.answer];
      inputs.forEach((i) => {
        const lab = i.parentElement;
        lab.classList.remove('mark-ok', 'mark-bad');
        if (i.checked && answer.includes(+i.value) && res.ok) lab.classList.add('mark-ok');
        if (i.checked && !answer.includes(+i.value)) lab.classList.add('mark-bad');
      });
    },
  };
};

MOUNTS.counterexample = (ex) => {
  const { premises, conclusion } = argumentOf(ex);
  const letters = lettersIn([...premises, conclusion]);
  const val = {};
  const groups = letters.map((l) => {
    const t = h('button', { type: 'button', class: 't', 'aria-pressed': 'false', 'aria-label': `${l} true` }, 'T');
    const f = h('button', { type: 'button', class: 'f', 'aria-pressed': 'false', 'aria-label': `${l} false` }, 'F');
    const set = (v) => {
      val[l] = v;
      t.setAttribute('aria-pressed', String(v === true));
      f.setAttribute('aria-pressed', String(v === false));
      valid.checked = false;
    };
    t.addEventListener('click', () => set(true));
    f.addEventListener('click', () => set(false));
    return { l, set, el: h('span', { class: 'tv' }, h('span', {}, l), t, f) };
  });
  const valid = h('input', { type: 'checkbox', id: `v-${ex.id}` });
  return {
    el: [
      dictionaryList(ex.dictionary),
      givenLine(formulaText(ex.argument)),
      h('p', { class: 'small muted' }, 'Make every premise true and the conclusion false, or say there is no way to.'),
      h('div', { class: 'valuation' }, groups.map((g) => g.el)),
      h('label', { class: 'small', for: `v-${ex.id}` }, valid, ' No such assignment: the argument is valid'),
    ],
    value: () => (valid.checked ? { claimValid: true } : { valuation: { ...val } }),
    show: (ans) => {
      if (ans.claimValid) { valid.checked = true; return; }
      groups.forEach((g) => g.set(ans.valuation[g.l]));
    },
  };
};

MOUNTS.proof = (ex, ctx) => {
  const { premises, conclusion } = argumentOf(ex);
  const mode = ex.mode ?? 'full';
  const editor = proofEditor({
    premises, conclusion, mode, given: ex.solution, blanks: ex.blanks ?? [], set: setFor(ex, ex.argument), onEnterLast: () => ctx.check(),
  });
  let hintLevel = 0;
  const hintBtn = h('button', { type: 'button', class: 'btn quiet' }, 'Hint');
  hintBtn.addEventListener('click', () => {
    const hs = hints({ premises, conclusion, lines: editor.value() }, { allowedRules: ex.allowedRules, maxApps: ex.maxApps });
    const shown = hs.slice(0, ++hintLevel);
    if (hintLevel >= hs.length) hintLevel = 0;
    ctx.info(shown.length ? shown : ['No suggestion here. Look at the conclusion’s main operator and work backward.']);
  });
  const rules = ex.allowedRules ? h('p', { class: 'small muted' }, `Rules available: ${ex.allowedRules.join(', ')}.`) : null;
  return {
    el: [dictionaryList(ex.dictionary), rules, editor.el],
    extraActions: mode === 'full' ? [hintBtn] : [],
    value: () => editor.value(),
    show: (ans) => {
      if (mode === 'justify') editor.setJustifications(ans.map((l) => l.just));
      else if (mode === 'fill') editor.setFormulas(ans.map((l) => l.text));
      else editor.setLines(ans);
    },
    mark: (res) => editor.mark(res.result),
    focus: () => editor.focus(),
  };
};

// --- card ----------------------------------------------------------------------

function feedbackContent(res) {
  const parts = [h('p', {}, inline(res.message))];
  if (res.hint) parts.push(h('p', {}, res.hint));
  return parts;
}

export function renderExercise(ex, index) {
  const status = h('span', { class: 'status' });
  const feedback = h('div', { class: 'feedback', 'aria-live': 'polite' });
  const work = h('div', { class: 'work', style: 'display:grid;gap:0.7rem;min-width:0' });
  const card = h('section', { class: 'exercise', id: `ex-${ex.id}`, 'aria-labelledby': `ex-${ex.id}-t` },
    h('div', { class: 'ex-head' },
      h('span', { class: 'ex-num', id: `ex-${ex.id}-t` }, `Exercise ${index}`),
      h('span', { class: 'ex-kind' }, LABEL[ex.type] ?? ex.type),
      status),
    h('p', { class: 'prompt' }, inline(ex.prompt)),
    work);

  let revealed = !!solvedState(ex.id)?.revealed && !solvedState(ex.id)?.solved;
  const paintStatus = () => {
    clear(status);
    const s = solvedState(ex.id);
    if (s?.solved && !s.revealed) { status.append(h('span', { class: 'chip ok' }, 'Solved')); card.classList.add('solved'); }
    else if (s?.solved) status.append(h('span', { class: 'chip shown' }, 'Solved with the answer shown'));
    else if (s?.revealed) status.append(h('span', { class: 'chip shown' }, 'Answer shown'));
  };

  const ctx = {};
  const widget = MOUNTS[ex.type](ex, ctx);
  append(work, widget.el);

  const show = (kind, content) => {
    clear(feedback);
    feedback.className = `feedback ${kind}`;
    feedback.append(...content);
  };

  ctx.check = () => {
    let res;
    try {
      res = checkAnswer(ex, widget.value());
    } catch (e) {
      show('bad', [h('p', {}, `Something went wrong while checking: ${e.message}`)]);
      return;
    }
    widget.mark?.(res);
    const content = feedbackContent(res);
    if (res.suggestions?.length) {
      const fixes = h('div', { class: 'fixes' }, 'Did you mean ',
        res.suggestions.map((s) => h('button', {
          type: 'button', class: 'btn', onclick: () => { widget.show(s); ctx.check(); },
        }, s)));
      content.push(fixes);
    }
    show(res.ok ? 'ok' : 'bad', content);
    if (res.ok) { markSolved(ex.id, { revealed }); paintStatus(); }
  };
  ctx.info = (lines) => show('info', lines.map((l) => h('p', {}, inline(l))));

  const checkBtn = h('button', { type: 'button', class: 'btn primary', onclick: ctx.check }, 'Check');
  const showBtn = h('button', { type: 'button', class: 'btn quiet' }, 'Show answer');
  showBtn.addEventListener('click', () => {
    revealed = true;
    markRevealed(ex.id);
    widget.show(modelAnswer(ex));
    const res = checkAnswer(ex, widget.value());
    widget.mark?.(res);
    show('info', [h('p', {}, inline(ex.explain ?? 'Here is one correct answer. Study it, then try the next exercise without help.'))]);
    paintStatus();
  });
  card.append(h('div', { class: 'actions' }, checkBtn, widget.extraActions ?? [], showBtn), feedback);
  paintStatus();
  return card;
}

function append(el, kids) {
  for (const k of [kids].flat(Infinity)) if (k) el.append(k);
}

export { LABEL };
