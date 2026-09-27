// The course map. Lessons are numbered through the whole course.

import l01 from './part1/01-arguments.js';
import l02 from './part1/02-operators.js';
import l03 from './part1/03-truth-functions.js';
import l04 from './part1/04-statement-tables.js';
import l05 from './part1/05-argument-tables.js';
import l06 from './part1/06-forms.js';
import l07 from './part1/07-implication-rules.js';
import l08 from './part1/08-replacement-rules.js';
import l09 from './part1/09-conditional-proof.js';
import l10 from './part1/10-indirect-proof.js';

export const PARTS = [
  {
    id: 'sentential',
    numeral: 'I',
    title: 'Sentential logic',
    blurb: 'Statements, the five truth-functional operators, truth tables, and proofs with Hurley’s eighteen rules, conditional proof and indirect proof. The logic the Stoics built, made exact.',
    lessons: [l01, l02, l03, l04, l05, l06, l07, l08, l09, l10],
  },
];

PARTS.forEach((part) => part.lessons.forEach((l) => { l.part = part.id; }));

export const LESSONS = PARTS.flatMap((p) => p.lessons);

export function lessonById(id) {
  return LESSONS.find((l) => l.id === id);
}
