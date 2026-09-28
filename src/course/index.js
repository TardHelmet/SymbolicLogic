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
import l11 from './part2/11-quantifiers.js';
import l12 from './part2/12-square.js';
import l13 from './part2/13-quantifier-rules.js';
import l14 from './part2/14-change-of-quantifier.js';
import l15 from './part2/15-invalidity.js';
import l16 from './part2/16-relations.js';
import l17 from './part2/17-identity.js';
import l18 from './part3/18-paradox.js';
import l19 from './part3/19-three-values.js';
import l20 from './part3/20-worlds.js';
import l21 from './part3/21-implication.js';
import l22 from './part3/22-intuitionism.js';
import l23 from './part3/23-capstone.js';

export const PARTS = [
  {
    id: 'sentential',
    title: 'Sentential logic',
    blurb: 'Statements, the five truth-functional operators, truth tables, and proofs with Copi’s nineteen rules, conditional proof and indirect proof. The logic the Stoics built, made exact.',
    lessons: [l01, l02, l03, l04, l05, l06, l07, l08, l09, l10],
  },
  {
    id: 'predicate',
    title: 'Predicate logic',
    blurb: 'Names, predicates, relations and the quantifiers “all” and “some”; the square of opposition; proofs with quantifier rules; countermodels; and identity, with Russell’s theory of descriptions.',
    lessons: [l11, l12, l13, l14, l15, l16, l17],
  },
  {
    id: 'beyond',
    title: 'Beyond the classical',
    blurb: 'Paradoxes; logics with a third truth value, where contradictions need not explode; possible worlds; stricter conditionals; and intuitionistic logic, where excluded middle fails. Each is tested against the classical laws of {@part:sentential} and {@part:predicate}.',
    lessons: [l18, l19, l20, l21, l22, l23],
  },
];

// Numbers follow position, so lessons can be added without renumbering files.
const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'];
let n = 0;
PARTS.forEach((part, i) => {
  part.numeral = NUMERALS[i];
  part.lessons.forEach((l) => { l.part = part.id; l.number = ++n; });
});

export const LESSONS = PARTS.flatMap((p) => p.lessons);

export function lessonById(id) {
  return LESSONS.find((l) => l.id === id);
}
