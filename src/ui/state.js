// Settings and progress, kept in localStorage when it is available. Every
// access is guarded: private windows and blocked storage must not break the
// course, they only mean progress is not remembered.

const KEY = 'symbolic-logic.v1';

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (data && data.version === 1) return data;
  } catch { /* storage unavailable */ }
  return { version: 1, settings: { notation: 'hurley' }, solved: {} };
}

const data = load();

function save() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* storage unavailable */ }
}

export const settings = {
  get notation() { return data.settings.notation === 'modern' ? 'modern' : 'hurley'; },
  set notation(v) { data.settings.notation = v; save(); },
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
