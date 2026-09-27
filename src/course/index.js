// The course map. Lessons are numbered through the whole course.

import l01 from './part1/01-arguments.js';
import l02 from './part1/02-operators.js';
import l03 from './part1/03-truth-functions.js';

export const PARTS = [
  {
    id: 'sentential',
    numeral: 'I',
    title: 'Sentential logic',
    blurb: 'Statements, the five truth-functional operators, truth tables, and proofs with Hurley’s eighteen rules, conditional proof and indirect proof. The logic the Stoics built, made exact.',
    lessons: [l01, l02, l03],
  },
];

PARTS.forEach((part) => part.lessons.forEach((l) => { l.part = part.id; }));

export const LESSONS = PARTS.flatMap((p) => p.lessons);

export function lessonById(id) {
  return LESSONS.find((l) => l.id === id);
}
