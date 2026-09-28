# Symbolic Logic

A course in logic after Copi and Langer.

- **Rules and notation** follow Copi, Cohen and Rodych, *Introduction to Logic* (15th ed.): `~ • ∨ ⊃ ≡`, `(x)`, `(∃x)`, the nineteen rules, conditional and indirect proof, U.I./U.G./E.I./E.G., quantifier negation. Identity follows Copi's *Symbolic Logic* (5th ed.).
- **Logical form, classes, Boolean algebra and the axiomatic method** follow Susanne Langer's *An Introduction to Symbolic Logic* (1937).
- **Hurley's** *Concise Introduction to Logic* is cited second, and the Reference page lists where it differs from Copi.

The course has four parts:

- **Part I, sentential logic** (lessons 1–11): logical form, arguments and form, the five operators, truth tables, argument forms and fallacies, and natural-deduction proofs.
- **Part II, predicate logic** (lessons 12–18): quantifiers and translation, the square of opposition, the quantifier rules, countermodels, relations, identity and descriptions.
- **Part III, form and system** (lessons 19–21): classes and class equations, Huntington's postulates with proofs from them, duality, interpretations and independence, and the calculus of *Principia Mathematica* with axiomatic proofs.
- **Part IV, beyond the classical** (lessons 22–27):
  - paradoxes;
  - three-valued logics (K3, LP, weak Kleene, Ł3);
  - possible worlds (K, T, S4, S5);
  - strict, relevant and connexive conditionals;
  - intuitionistic logic;
  - a capstone on formalizing philosophical arguments.

There are 27 lessons and 310 exercises. Every exercise is checked by a logic engine rather than by comparing text:

- **Translations** are accepted when they are logically equivalent to the key. A wrong one gets a concrete situation (a row, a small world, or a Kripke model) where it and the sentence come apart.
- **Tables are computed**, not keyed in: truth tables, three-valued tables, Kripke evaluations, and the operation tables of finite algebras.
- **Proofs are checked line by line** in each of three styles: Copi's natural deduction, derivations of equations from Huntington's postulates, and axiomatic proofs in *Principia*'s system or Rosser's. Feedback names the rule that actually fits, the fallacy, the missing step, or a falsifying row.
- **First-order answers** are checked by searching finite models: a decision procedure for one-place predicates, a bounded search for relations. Class equations are checked the same way. Modal and intuitionistic answers are checked by searching Kripke models of up to three worlds.

Formulas can be displayed in three notations: Copi's, *Principia*'s dots as brackets (as Langer writes them), and modern. Typing always uses Copi's symbols or their ASCII stand-ins.

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

runs three kinds of test:

- **Engine unit tests.** These include round trips through the dot notation for 400 random formulas.
- **A colour-contrast check** on the theme.
- **A content-integrity test.** It:
  - marks every exercise's own model answer with the same checker the site uses, and rejects each listed wrong answer;
  - parses every formula in the lesson text and reads it back from dots;
  - checks every worked proof;
  - resolves every citation and cross-reference.

```sh
npm run smoke
```

needs Playwright with Chromium. It serves the site under `/SymbolicLogic/`, as GitHub Pages would, and then:

- reveals and checks every exercise through the real interface;
- completes a translation, a truth table and a proof using only the keyboard;
- checks phone-width layout in Copi's and in Principia notation;
- checks dark mode, deep links, the notation switch and blocked storage.

## Layout

- **`src/logic/`**: no DOM access. It contains:
  - the parser, printer and dot notation (`dots.js`);
  - truth tables, rules and the natural-deduction checker (`proof.js`);
  - finite models;
  - the algebra of classes (`algebra.js`);
  - axiomatic proofs and matrices (`axiomatic.js`);
  - Polish notation;
  - three-valued matrices, Kripke models and answer checking.
- **`src/course/`**: the lessons (`part1/` to `part4/`), the course map and the bibliography. Lesson numbers come from the course map; prose refers to lessons as `{@id}`.
- **`src/ui/`**: the browser interface.
- **`fonts/`**: self-hosted subsets of Source Serif 4, IBM Plex Sans and STIX Two Text (SIL Open Font License).

## Conventions

Copi's conventions are switches in `DEFAULTS` in `src/logic/proof.js`:

- **One rule per line.** A line applies one rule, once ("only one Rule of Inference should be applied at a time").
- **Indirect proof.** It is complete at the explicit contradiction reached from the denial of the conclusion. Hurley's discharge form (the negation of the assumption, then D.N.) is also accepted, and is the form used inside a larger proof.
- **Identity substitution** works in either direction, as in *Symbolic Logic* §5.4.

The 15th edition's own layout of conditional and indirect proof (§§9.11–9.12) could not be checked against the text, so these switches let it be matched.
