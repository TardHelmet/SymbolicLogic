// Settings and progress, kept in localStorage when it is available. Every
// access is guarded: private windows and blocked storage must not break the
// course, they only mean progress is not remembered.

import { normalizeNotation } from '../logic/notation.js';

const KEY = 'symbolic-logic.v1';

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (data && data.version === 1) return data;
  } catch { /* storage unavailable */ }
  return { version: 1, settings: { notation: 'copi' }, solved: {} };
}

const data = load();

function save() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* storage unavailable */ }
}

export const settings = {
  // 'copi' (stored as 'hurley' by earlier versions), 'principia' or 'modern'.
  get notation() { return normalizeNotation(data.settings.notation); },
  set notation(v) { data.settings.notation = v; save(); },
  // What typed formulas are tidied into: students type Copi's brackets even
  // when the course is displayed in Principia's dots.
  get inputNotation() { return this.notation === 'modern' ? 'modern' : 'copi'; },
};

/** Record a solved exercise. revealed: the answer was shown first. */
export function markSolved(id, { revealed = false } = {}) {
  const prev = data.solved[id];
  if (prev && !prev.revealed && prev.solved) return;
  // Once the answer has been shown, a later solve still counts as assisted.
  data.solved[id] = { at: Date.now(), solved: true, revealed: revealed || !!prev?.revealed };
  save();
}

export function markRevealed(id) {
  if (data.solved[id]) return;
  data.solved[id] = { at: Date.now(), solved: false, revealed: true };
  save();
}

export function solvedState(id) {
  return data.solved[id] ?? null;
}

export function lessonProgress(lesson) {
  const ids = (lesson.exercises ?? []).map((e) => e.id);
  const solved = ids.filter((id) => data.solved[id]?.solved && !data.solved[id].revealed).length;
  return { solved, total: ids.length };
}
