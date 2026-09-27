# Symbolic Logic

A course in sentential logic, predicate logic and a short bridge into non-classical logics, in the notation and rule system of Hurley and Copi (`~ • ∨ ⊃ ≡`, `(x)`, `(∃x)`, the eighteen rules, CP and IP, UI/UG/EI/EG/CQ and identity).

Every exercise is checked by a logic engine rather than by comparing text:

- translations are accepted when they are logically equivalent to the key, and a wrong one is answered with a situation where it and the sentence come apart;
- truth tables are checked cell by cell;
- proofs are checked line by line, with the rule's actual output, named fallacies, and the quantifier restrictions explained;
- first-order answers are checked by searching finite models (a decision procedure for monadic formulas, a bounded search for relational ones).

Each lesson has a margin on the history and philosophy of what it teaches, with sources.

## Running it

The site is static: no build step and no dependencies. Browsers will not load its modules from a `file://` URL, so serve the folder:

```sh
npm start            # http://localhost:8000/
```

or any static server (`python3 -m http.server`). It can be published as-is with GitHub Pages.

## Tests

```sh
npm test
```

runs the engine's unit tests and a content-integrity test that marks every exercise's own model answer with the same checker the site uses, rejects each listed wrong answer, parses every formula in the lesson text, checks every worked proof, and resolves every citation.

## Layout

- `src/logic/`: parser, printer, truth tables, rules, proof checker, finite models, answer checking. No DOM access.
- `src/course/`: lessons (`part1/`, …), the course map and the bibliography.
- `src/ui/`: the browser interface.
- `fonts/`: self-hosted subsets of Source Serif 4, IBM Plex Sans and STIX Two Text (SIL Open Font License).
