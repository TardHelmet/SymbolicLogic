// The course map. Lessons are numbered through the whole course.

import argumentsLesson from './part1/arguments.js';
import operators from './part1/operators.js';
import truthFunctions from './part1/truth-functions.js';
import statementTables from './part1/statement-tables.js';
import argumentTables from './part1/argument-tables.js';
import forms from './part1/forms.js';
import implicationRules from './part1/implication-rules.js';
import replacementRules from './part1/replacement-rules.js';
import conditionalProof from './part1/conditional-proof.js';
import indirectProof from './part1/indirect-proof.js';
import quantifiers from './part2/quantifiers.js';
import square from './part2/square.js';
import quantifierRules from './part2/quantifier-rules.js';
import changeOfQuantifier from './part2/change-of-quantifier.js';
import invalidity from './part2/invalidity.js';
import relations from './part2/relations.js';
import identity from './part2/identity.js';
import paradox from './part4/paradox.js';
import threeValues from './part4/three-values.js';
import worlds from './part4/worlds.js';
import implication from './part4/implication.js';
import intuitionism from './part4/intuitionism.js';
import capstone from './part4/capstone.js';

export const PARTS = [
  {
    id: 'sentential',
    title: 'Sentential logic',
    blurb: 'Statements, the five truth-functional operators, truth tables, and proofs with Copi’s nineteen rules, conditional proof and indirect proof. The logic the Stoics built, made exact.',
    lessons: [argumentsLesson, operators, truthFunctions, statementTables, argumentTables, forms, implicationRules, replacementRules, conditionalProof, indirectProof],
  },
  {
    id: 'predicate',
    title: 'Predicate logic',
    blurb: 'Names, predicates, relations and the quantifiers “all” and “some”; the square of opposition; proofs with quantifier rules; countermodels; and identity, with Russell’s theory of descriptions.',
    lessons: [quantifiers, square, quantifierRules, changeOfQuantifier, invalidity, relations, identity],
  },
  {
    id: 'beyond',
    title: 'Beyond the classical',
    blurb: 'Paradoxes; logics with a third truth value, where contradictions need not explode; possible worlds; stricter conditionals; and intuitionistic logic, where excluded middle fails. Each is tested against the classical laws of {@part:sentential} and {@part:predicate}.',
    lessons: [paradox, threeValues, worlds, implication, intuitionism, capstone],
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
