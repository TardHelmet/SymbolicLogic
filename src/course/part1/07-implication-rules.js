const IMPL = ['MP', 'MT', 'HS', 'DS', 'CD', 'Simp', 'Conj', 'Add'];

export default {
  id: 'implication-rules',
  number: 7,
  title: 'Proofs I: the rules of implication',
  hurley: '§§7.1–7.2',
  card: 'Natural deduction: deriving a conclusion step by step with eight valid argument forms.',
  summary: 'A proof shows that a conclusion follows by deriving it one small, obviously valid step at a time. Each step applies a rule, and each rule is a valid argument form.',
  reading: [
    { h: 'Why proofs' },
    'Truth tables decide validity, but they grow exponentially: an argument with 20 letters has over a million rows. They also do not survive into predicate logic, where there are infinitely many possible situations to check. And they do not show *why* a conclusion follows. A **proof** does: it is a chain of steps, each licensed by a rule whose validity is beyond doubt.',
    { h: 'What a proof looks like' },
    'The premises are numbered first, and the conclusion is written after a slash on the last premise line. Every further line must follow from earlier lines by a rule, and its **justification** names the lines it uses and the rule, as in “1, 3, MP”. The proof ends when the conclusion appears on a line of its own.',
    { proof: `1. A ⊃ B
2. B ⊃ C
3. A          / C
4. B          1, 3, MP
5. C          2, 4, MP` },
    { h: 'The eight rules of implication' },
    'Each rule is one of the valid forms from lesson 6, or an obvious relative.',
    { rules: IMPL },
    { list: [
      'The variables match any statement, however complex. {(A • B) ⊃ ~C} and {A • B} give {~C} by MP, with {A • B} for *p*.',
      'These rules apply only to **whole lines**. From {(A • B) ⊃ C} you may not infer {A ⊃ C} by applying Simp inside the line; that inference is not even valid.',
      'Hurley’s Simp gives only the **left** conjunct, and DS needs the negation of the **left** disjunct. In the next lesson a rule (Com) lets you swap them.',
      'Add lets you add *any* disjunct, which seems like cheating until you notice that a disjunction with one true part is true.',
    ] },
    { h: 'Strategy' },
    'Work backward from the conclusion. Ask where it could come from: if it is the consequent of a conditional among the premises, you need that conditional’s antecedent (MP); if it is a disjunct, you need the negation of the other disjunct (DS); if it is a conjunction, get each half and use Conj. Then ask where *those* lines could come from. Meanwhile, work forward: break conjunctions apart with Simp, and apply MP and MT wherever they fit. The two directions usually meet.',
    { example: 'Working backward', steps: [
      'Prove {D} from {(A ∨ B) ⊃ ~C}, {C ∨ D} and {A}.',
      '{D} is a disjunct of {C ∨ D}, so aim for {~C} and use DS.',
      '{~C} is the consequent of premise 1, so aim for {A ∨ B} and use MP.',
      '{A ∨ B} comes from {A} by Add. Now write it forward:',
      { proof: `1. (A ∨ B) ⊃ ~C
2. C ∨ D
3. A          / D
4. A ∨ B      3, Add
5. ~C         1, 4, MP
6. D          2, 5, DS` },
    ], stepwise: true },
    'In the exercises, write one line per step: the formula, then the justification. Use the Hint button when stuck. The checker marks each line separately, and when a step fails it tells you whether the line follows by a different rule, what the cited rule would actually give, or that it does not follow at all.',
  ],
  exercises: [
    { id: 'ir-1', type: 'proof', prompt: 'Prove the conclusion.', argument: '(A • B) ⊃ C, A • B / C', allowedRules: IMPL,
      solution: [['C', '1, 2, MP']] },
    { id: 'ir-2', type: 'proof', prompt: 'Prove the conclusion.', argument: 'A ⊃ (B ∨ C), A, ~B / C', allowedRules: IMPL,
      solution: [['B ∨ C', '1, 2, MP'], ['C', '4, 3, DS']] },
    { id: 'ir-3', type: 'proof', prompt: 'Prove the conclusion.', argument: 'A • B, (A ∨ C) ⊃ D / D', allowedRules: IMPL,
      solution: [['A', '1, Simp'], ['A ∨ C', '3, Add'], ['D', '2, 4, MP']] },
    { id: 'ir-4', type: 'proof', prompt: 'Supply the justifications.', argument: '~A ⊃ (B ⊃ C), ~A, C ⊃ D / B ⊃ D', allowedRules: IMPL, mode: 'justify',
      solution: [['B ⊃ C', '1, 2, MP'], ['B ⊃ D', '4, 3, HS']] },
    { id: 'ir-5', type: 'proof', prompt: 'Prove the conclusion.', argument: 'A ⊃ B, C ⊃ D, ~B, ~D / ~A • ~C', allowedRules: IMPL,
      solution: [['~A', '1, 3, MT'], ['~C', '2, 4, MT'], ['~A • ~C', '5, 6, Conj']] },
    { id: 'ir-6', type: 'proof', prompt: 'Prove the conclusion.', argument: '(A ⊃ B) • (C ⊃ D), A / B ∨ D', allowedRules: IMPL,
      solution: [['A ∨ C', '2, Add'], ['B ∨ D', '1, 3, CD']] },
    { id: 'ir-7', type: 'proof', prompt: 'Fill in the missing line.', argument: '(A ⊃ B) • (C ⊃ D), ~B • ~D / ~A', allowedRules: IMPL, mode: 'fill', blanks: [1],
      solution: [['A ⊃ B', '1, Simp'], ['~B', '2, Simp'], ['~A', '3, 4, MT']] },
    { id: 'ir-8', type: 'proof', prompt: 'Prove the conclusion.', argument: 'P ∨ Q, ~P, Q ⊃ (R • S) / R', allowedRules: IMPL,
      solution: [['Q', '1, 2, DS'], ['R • S', '3, 4, MP'], ['R', '5, Simp']] },
    { id: 'ir-9', type: 'proof', prompt: 'Prove the conclusion.', argument: 'J ⊃ K, K ⊃ L, L ⊃ M, ~M / ~J', allowedRules: IMPL,
      solution: [['J ⊃ L', '1, 2, HS'], ['J ⊃ M', '5, 3, HS'], ['~J', '6, 4, MT']] },
    { id: 'ir-10', type: 'proof', prompt: 'The dog at the fork of three roads (A, B, C): the hare took one of them, not the first, not the second. Prove that it took the third.',
      dictionary: { A: 'the hare took the first road', B: 'the hare took the second road', C: 'the hare took the third road' },
      argument: 'A ∨ (B ∨ C), ~A, ~B / C', allowedRules: IMPL,
      solution: [['B ∨ C', '1, 2, DS'], ['C', '4, 3, DS']] },
    { id: 'ir-11', type: 'proof', prompt: 'Prove the conclusion.', argument: '(A ∨ B) ⊃ (C • D), (C ∨ E) ⊃ F, A / F', allowedRules: IMPL,
      solution: [['A ∨ B', '3, Add'], ['C • D', '1, 4, MP'], ['C', '5, Simp'], ['C ∨ E', '6, Add'], ['F', '2, 7, MP']] },
    {
      id: 'ir-tortoise',
      type: 'choice',
      prompt: 'Carroll’s Tortoise accepts {A} and {A ⊃ B} but will not accept {B} until {[A • (A ⊃ B)] ⊃ B} is added as a premise. Once it is added, he asks for another. Why does adding premises never finish the job?',
      options: [
        'Because the added premise is false.',
        'Because getting from the premises to the conclusion always takes a step of inference, and a rule of inference is not one more premise.',
        'Because modus ponens is not valid.',
      ],
      answer: 1,
      why: ['It is a tautology, true on every row.', null, 'It is valid; the Tortoise’s problem lies elsewhere.'],
      explain: 'Each new premise is one more statement that still has to be *used*. Using premises is what rules do, and no list of premises can do it for you.',
    },
  ],
  margin: {
    title: 'The Tortoise and the rule',
    body: [
      'In 1895 Lewis Carroll published a dialogue in *Mind*. The Tortoise grants Achilles the premises of a valid argument but will not grant the conclusion. Achilles writes down, as a further premise, that if the premises are true the conclusion must be. The Tortoise accepts that too, and asks for the premise that says the conclusion follows from *these* premises, and so on without end.',
      'The standard moral is Ryle’s: a rule of inference is not a premise. “A, so B” is licensed by a rule that says you may pass from A to B; it is not the statement “if A, B” added to the list. A proof system has to contain *rules* as well as statements. Philosophers still argue about what grasping a rule consists in, since it cannot be believing one more proposition.',
      'Natural deduction, which tries to follow the inferences people actually make, was invented independently by Jaśkowski and Gentzen in 1934. Hurley’s system descends from Copi’s *Symbolic Logic* (1954), which combined natural-deduction methods with rules drawn from the traditional valid forms.',
    ],
    sources: ['carroll1895', 'ryle1950', 'gentzen1935', 'jaskowski1934', 'ndSEP', 'hurley2018'],
  },
};
