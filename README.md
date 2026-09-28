# Symbolic Logic

A course in logic in the notation and rule system of Copi, Cohen and Rodych, *Introduction to Logic* (15th ed.): `~ • ∨ ⊃ ≡`, `(x)`, `(∃x)`, the nineteen rules, conditional and indirect proof, U.I./U.G./E.I./E.G., quantifier negation, and identity from Copi's *Symbolic Logic*. Susanne Langer's *An Introduction to Symbolic Logic* supplies logical form, classes, Boolean algebra and the axiomatic method. Hurley's *Concise Introduction to Logic* is cited second.

- **Part I, sentential logic** (lessons 1–10): arguments and form, the five operators, truth tables, argument forms and fallacies, and natural-deduction proofs.
- **Part II, predicate logic** (lessons 11–17): quantifiers and translation, the square of opposition, quantifier rules, countermodels, relations, identity and descriptions.
- **Part III, beyond the classical** (lessons 18–23): paradoxes, three-valued logics (K3, LP, weak Kleene, Ł3), possible worlds (K, T, S4, S5), strict, relevant and connexive conditionals, intuitionistic logic, and a capstone on formalizing philosophical arguments.

There are 23 lessons and 261 exercises. Every exercise is checked by a logic engine rather than by comparing text:

- translations are accepted when they are logically equivalent to the key; a wrong one gets a concrete situation (a row, a small world, or a Kripke model) where it and the sentence come apart;
- truth tables, three-valued tables and Kripke evaluations are computed, not keyed in;
- proofs are checked line by line, with the rule's actual output, named fallacies, and the quantifier restrictions explained;
- first-order answers are checked by searching finite models (a decision procedure for one-place predicates, a bounded search for relations), and modal and intuitionistic ones by searching Kripke models of up to three worlds.

Each lesson has a margin on the history and philosophy of what it teaches, with sources collected on the Sources page.

## Running it

The site is static, with no build step and no dependencies. Browsers will not load its modules from a `file://` URL, so serve the folder:

```sh
npm start            # http://localhost:8000/
```

or use any static server (`python3 -m http.server`). It can be published as-is with GitHub Pages; all URLs are relative.

## Tests

```sh
npm test
```

runs the engine's unit tests, a colour-contrast check on the theme, and a content-integrity test. The content test marks every exercise's own model answer with the same checker the site uses, rejects each listed wrong answer, parses every formula in the lesson text, checks every worked proof, and resolves every citation.

```sh
npm run smoke
```

needs Playwright with Chromium. It serves the site under `/SymbolicLogic/` as GitHub Pages would, reveals and checks every exercise through the real interface, completes a translation, a truth table and a proof using only the keyboard, and checks phone-width layout, dark mode, deep links and blocked storage.

## Layout

- `src/logic/`: parser, printer, truth tables, rules, proof checker, finite models, three-valued matrices, Kripke models and answer checking. No DOM access.
- `src/course/`: the lessons (`part1/`, `part2/`, `part3/`), the course map and the bibliography.
- `src/ui/`: the browser interface.
- `fonts/`: self-hosted subsets of Source Serif 4, IBM Plex Sans and STIX Two Text (SIL Open Font License).

## Conventions

Copi's conventions are switches in `DEFAULTS` in `src/logic/proof.js`: one application of one rule per line; indirect proof complete at the explicit contradiction, with Hurley's discharge form (negation of the assumption, then D.N.) also accepted; identity substitution in either direction.
