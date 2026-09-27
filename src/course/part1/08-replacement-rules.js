export default {
  id: 'replacement-rules',
  number: 8,
  title: 'Proofs II: the rules of replacement',
  hurley: '§§7.3–7.4',
  card: 'Ten equivalences that can be used anywhere in a line, and how they put formulas into the shape the other rules need.',
  summary: 'A rule of replacement says that two forms are logically equivalent, so either may replace the other wherever it occurs, even deep inside a line.',
  reading: [
    { h: 'Equivalences as rules' },
    'Each rule below pairs two logically equivalent forms, written with {!::}. Because the forms are equivalent, replacing one with the other never changes the truth value of the line, even when the replacement happens inside a larger formula. So, unlike the rules of implication, **rules of replacement apply to parts of lines** as well as to whole lines.',
    { rules: ['DM', 'Com', 'Assoc', 'Dist', 'DN', 'Trans', 'Impl', 'Equiv', 'Exp', 'Taut'] },
    { list: [
      '**De Morgan (DM)** moves a tilde across a dot or wedge, flipping it: “not both” is “either not … or not …”.',
      '**Commutativity (Com)** and **Associativity (Assoc)** rearrange conjunctions and disjunctions. Use Com before Simp or DS when the part you need is on the right.',
      '**Double negation (DN)** adds or removes two tildes.',
      '**Transposition (Trans)**, **Material implication (Impl)** and **Exportation (Exp)** transform conditionals. Impl links {!⊃} with {!∨}: {p ⊃ q} is {~p ∨ q}.',
      '**Material equivalence (Equiv)** unpacks a biconditional into two conditionals, or into “both or neither”.',
      '**Tautology (Taut)** lets {p} and {p ∨ p} (or {p • p}) replace each other.',
    ] },
    { example: 'Replacement inside a line', steps: [
      'From {~(A • B) ⊃ C}, DM gives {(~A ∨ ~B) ⊃ C}: the rule rewrites the antecedent and leaves the rest alone.',
      'By contrast, from {(A • B) ⊃ C} you cannot get {A ⊃ C} by Simp, because Simp is a rule of implication. (Try A true, B false, C false.)',
    ] },
    { h: 'Using them' },
    'Replacement rules rarely finish a proof on their own. Their job is to put a line into the shape a rule of implication needs.',
    { proof: `1. ~A ∨ B
2. A          / B
3. ~~A        2, DN
4. B          1, 3, DS` },
    'Here {A} is not literally the negation of {~A}; DN turns it into {~~A}, which is, and DS applies. Similarly, to use MT on {A ⊃ ~B} and {B}, first turn {B} into {~~B}.',
    { example: 'A longer proof', steps: [
      'Prove {A ⊃ (B • C)} from {A ⊃ B} and {A ⊃ C}.',
      'Convert both conditionals to disjunctions with Impl, conjoin them, and factor out the common {~A} with Dist:',
      { proof: `1. A ⊃ B
2. A ⊃ C          / A ⊃ (B • C)
3. ~A ∨ B          1, Impl
4. ~A ∨ C          2, Impl
5. (~A ∨ B) • (~A ∨ C)   3, 4, Conj
6. ~A ∨ (B • C)    5, Dist
7. A ⊃ (B • C)     6, Impl` },
      'The next lesson gives a shorter route: conditional proof.',
    ], stepwise: true },
  ],
  exercises: [
    { id: 'rr-1', type: 'proof', prompt: 'Prove the conclusion.', argument: '~(A ∨ B) / ~A', solution: [['~A • ~B', '1, DM'], ['~A', '2, Simp']] },
    { id: 'rr-2', type: 'proof', prompt: 'Prove the conclusion.', argument: 'B • A / A', solution: [['A • B', '1, Com'], ['A', '2, Simp']] },
    { id: 'rr-3', type: 'proof', prompt: 'Prove the conclusion.', argument: 'A ⊃ ~A / ~A', solution: [['~A ∨ ~A', '1, Impl'], ['~A', '2, Taut']] },
    { id: 'rr-4', type: 'proof', prompt: 'Prove the conclusion.', argument: 'A ≡ B, A / B', solution: [['(A ⊃ B) • (B ⊃ A)', '1, Equiv'], ['A ⊃ B', '3, Simp'], ['B', '4, 2, MP']] },
    { id: 'rr-5', type: 'proof', prompt: 'Prove the conclusion.', argument: '~(A • ~B) / A ⊃ B', solution: [['~A ∨ ~~B', '1, DM'], ['~A ∨ B', '2, DN'], ['A ⊃ B', '3, Impl']] },
    { id: 'rr-6', type: 'proof', prompt: 'Prove the conclusion.', argument: '(A • B) ⊃ C, A / B ⊃ C', solution: [['A ⊃ (B ⊃ C)', '1, Exp'], ['B ⊃ C', '3, 2, MP']] },
    { id: 'rr-7', type: 'proof', prompt: 'Supply the justifications.', argument: '~(A ⊃ B) / A', mode: 'justify',
      solution: [['~(~A ∨ B)', '1, Impl'], ['~~A • ~B', '2, DM'], ['~~A', '3, Simp'], ['A', '4, DN']] },
    { id: 'rr-8', type: 'proof', prompt: 'Prove the conclusion.', argument: 'A ∨ (B • C) / A ∨ B', solution: [['(A ∨ B) • (A ∨ C)', '1, Dist'], ['A ∨ B', '2, Simp']] },
    { id: 'rr-9', type: 'proof', prompt: 'Prove the conclusion.', argument: 'A ⊃ ~B, B / ~A', solution: [['~~B', '2, DN'], ['~A', '1, 3, MT']] },
    { id: 'rr-10', type: 'proof', prompt: 'Fill in the missing lines.', argument: 'A ⊃ B, A ⊃ C / A ⊃ (B • C)', mode: 'fill', blanks: [0, 3],
      solution: [['~A ∨ B', '1, Impl'], ['~A ∨ C', '2, Impl'], ['(~A ∨ B) • (~A ∨ C)', '3, 4, Conj'], ['~A ∨ (B • C)', '5, Dist'], ['A ⊃ (B • C)', '6, Impl']] },
    { id: 'rr-11', type: 'proof', prompt: 'Prove the conclusion. (No conditional proof yet: turn the conditional into a disjunction.)', argument: '(A ⊃ B) ⊃ C, B / C',
      solution: [['B ∨ ~A', '2, Add'], ['~A ∨ B', '3, Com'], ['A ⊃ B', '4, Impl'], ['C', '1, 5, MP']] },
    { id: 'rr-12', type: 'proof', prompt: 'Prove the conclusion.', argument: '(A ∨ B) ⊃ C / A ⊃ C',
      solution: [['~(A ∨ B) ∨ C', '1, Impl'], ['(~A • ~B) ∨ C', '2, DM'], ['C ∨ (~A • ~B)', '3, Com'], ['(C ∨ ~A) • (C ∨ ~B)', '4, Dist'], ['C ∨ ~A', '5, Simp'], ['~A ∨ C', '6, Com'], ['A ⊃ C', '7, Impl']] },
    {
      id: 'rr-which', type: 'choice', prompt: 'Which step is **not** licensed by the rule named?',
      options: ['{~(A ∨ B)} to {~A • ~B} by DM', '{A ⊃ B} to {~B ⊃ ~A} by Trans', '{A ⊃ B} to {B ⊃ A} by Com', '{(A • B) ⊃ C} to {A ⊃ (B ⊃ C)} by Exp'],
      answer: 2,
      explain: 'Com applies to dots and wedges only. {A ⊃ B} and {B ⊃ A} are not equivalent at all: A true, B false makes the first false and the second true.',
    },
  ],
  margin: {
    title: 'An algebra of thought',
    body: [
      'Replacement rules treat logic as algebra: equivalent expressions may be substituted anywhere, as equal quantities may in arithmetic. This way of thinking comes from nineteenth-century Britain. Augustus De Morgan stated the laws that bear his name in his *Formal Logic* of 1847 (versions were known to medieval logicians). George Boole’s *Laws of Thought* (1854) developed a full algebra of classes and propositions.',
      'Boole derived the principle of contradiction as an algebraic law. Writing *x* for a class and *xx* for “the things that are *x* and *x*”, he noted that *xx* = *x*, and so *x*(1 − *x*) = 0: nothing is both *x* and not *x*. The same idempotence is Hurley’s Taut: {p} may replace, and be replaced by, {p • p}.',
      'Every replacement rule here can be checked by a truth table, and the course’s tests do exactly that: each pair of forms is verified to agree on every row.',
    ],
    sources: ['demorgan1847', 'boole1854', 'kneale1962', 'hurley2018'],
  },
};
