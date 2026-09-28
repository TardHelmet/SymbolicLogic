const NO_HS = ['MP', 'MT', 'DS', 'CD', 'Simp', 'Conj', 'Add', 'DM', 'Com', 'Assoc', 'Dist', 'DN', 'Trans', 'Impl', 'Equiv', 'Exp', 'Taut', 'ACP', 'CP'];

export default {
  id: 'conditional-proof',
  title: 'Conditional proof',
  hurley: '§7.5',
  card: 'Proving “if p then q” by supposing p and deriving q.',
  summary: 'To prove a conditional, suppose its antecedent and derive its consequent. This is how people argue for conditionals, and it makes many proofs much shorter.',
  reading: [
    { h: 'The method' },
    'Suppose you want to prove {p ⊃ q}. Begin an **indented sequence** by assuming {p} (justified “ACP”, assumption for conditional proof). Using {p} together with the premises and any earlier lines, derive {q}. Then end the sequence and write {p ⊃ q}, justified by citing the whole sequence and “CP”.',
    { proof: `1. A ⊃ B
2. B ⊃ C       / A ⊃ C
3. A           ACP
4. B           1, 3, MP
5. C           2, 4, MP
6. A ⊃ C       3–5, CP` },
    'The vertical line marks the scope of the assumption. In this course you never indent by hand: an ACP line opens a sequence, and a CP line that cites it closes it.',
    { h: 'Why it is valid' },
    'The sequence shows that the premises together with {p} lead to {q}. So in any situation where the premises are true, either {p} is false or {q} is true; that is, {p ⊃ q} is true. The conclusion depends only on the premises, not on the assumption, which has been **discharged**.',
    { h: 'The one restriction' },
    'Once a sequence is closed, the lines inside it may not be cited again: they were derived under a supposition that is no longer in force. Line 4 above says {B} only *on the assumption that* {A}; after line 6 nothing says {B} outright.',
    { h: 'Nesting' },
    'Sequences can be nested, one assumption inside another, to prove conditionals whose consequents are conditionals. Close the inner one first.',
    { example: 'A nested conditional proof', steps: [
      'Prove {B ⊃ (A ⊃ C)} from {A ⊃ (B ⊃ C)}.',
      'The conclusion is a conditional, so assume its antecedent {B}. The new goal, {A ⊃ C}, is also a conditional, so assume {A} as well.',
      { proof: `1. A ⊃ (B ⊃ C)     / B ⊃ (A ⊃ C)
2. B               ACP
3. A               ACP
4. B ⊃ C           1, 3, MP
5. C               4, 2, MP
6. A ⊃ C           3–5, CP
7. B ⊃ (A ⊃ C)     2–6, CP` },
    ], stepwise: true },
    'Conditional proof is also useful when the conclusion is not itself a conditional: prove a conditional you need along the way, then use it with MP or another rule.',
  ],
  exercises: [
    { id: 'cp-1', type: 'proof', prompt: 'Prove by conditional proof (HS is not available here).', argument: 'A ⊃ B, B ⊃ C / A ⊃ C', allowedRules: NO_HS,
      solution: [['A', 'ACP'], ['B', '1, 3, MP'], ['C', '2, 4, MP'], ['A ⊃ C', '3–5, CP']] },
    { id: 'cp-2', type: 'proof', prompt: 'Prove the conclusion.', argument: '(A ∨ B) ⊃ C / A ⊃ C',
      solution: [['A', 'ACP'], ['A ∨ B', '2, Add'], ['C', '1, 3, MP'], ['A ⊃ C', '2–4, CP']] },
    { id: 'cp-3', type: 'proof', prompt: 'Prove the conclusion.', argument: 'A ⊃ B / (A • C) ⊃ (B • C)',
      solution: [['A • C', 'ACP'], ['A', '2, Simp'], ['B', '1, 3, MP'], ['C • A', '2, Com'], ['C', '5, Simp'], ['B • C', '4, 6, Conj'], ['(A • C) ⊃ (B • C)', '2–7, CP']] },
    { id: 'cp-4', type: 'proof', prompt: 'Prove the conclusion.', argument: 'A ⊃ (B ⊃ C), A ⊃ B / A ⊃ C',
      solution: [['A', 'ACP'], ['B ⊃ C', '1, 3, MP'], ['B', '2, 3, MP'], ['C', '4, 5, MP'], ['A ⊃ C', '3–6, CP']] },
    { id: 'cp-5', type: 'proof', prompt: 'Prove the conclusion, using two conditional proofs.', argument: 'A ⊃ (B • C) / (A ⊃ B) • (A ⊃ C)',
      solution: [['A', 'ACP'], ['B • C', '1, 2, MP'], ['B', '3, Simp'], ['A ⊃ B', '2–4, CP'], ['A', 'ACP'], ['B • C', '1, 6, MP'], ['C • B', '7, Com'], ['C', '8, Simp'], ['A ⊃ C', '6–9, CP'], ['(A ⊃ B) • (A ⊃ C)', '5, 10, Conj']] },
    { id: 'cp-6', type: 'proof', prompt: 'Prove by nested conditional proof.', argument: 'A ⊃ (B ⊃ C) / B ⊃ (A ⊃ C)',
      solution: [['B', 'ACP'], ['A', 'ACP'], ['B ⊃ C', '1, 3, MP'], ['C', '4, 2, MP'], ['A ⊃ C', '3–5, CP'], ['B ⊃ (A ⊃ C)', '2–6, CP']] },
    { id: 'cp-7', type: 'proof', prompt: 'Supply the justifications.', argument: '(A • B) ⊃ C, A / B ⊃ C', mode: 'justify',
      solution: [['B', 'ACP'], ['A • B', '2, 3, Conj'], ['C', '1, 4, MP'], ['B ⊃ C', '3–5, CP']] },
    { id: 'cp-8', type: 'proof', prompt: 'Prove the conclusion. The conclusion is not a conditional, but premise 1 needs one: prove {A ⊃ C} by conditional proof along the way.', argument: '(A ⊃ C) ⊃ D, B ⊃ C, ~B ⊃ ~A / D',
      solution: [['A', 'ACP'], ['~~A', '4, DN'], ['~~B', '3, 5, MT'], ['B', '6, DN'], ['C', '2, 7, MP'], ['A ⊃ C', '4–8, CP'], ['D', '1, 9, MP']] },
    { id: 'cp-9', type: 'proof', prompt: 'Prove the conclusion.', argument: 'A ⊃ B, C ⊃ D / (A • C) ⊃ (B • D)',
      solution: [['A • C', 'ACP'], ['A', '3, Simp'], ['B', '1, 4, MP'], ['C • A', '3, Com'], ['C', '6, Simp'], ['D', '2, 7, MP'], ['B • D', '5, 8, Conj'], ['(A • C) ⊃ (B • D)', '3–9, CP']] },
    {
      id: 'cp-scope', type: 'choice',
      prompt: 'In the first proof of the reading, why may a later line not cite line 4 ({B})?',
      options: ['Because {B} is false.', 'Because {B} was derived only on the assumption {A}, which has been discharged.', 'Because line 4 used MP.'],
      answer: 1,
      explain: 'Outside the sequence, nothing establishes {B}; only {A ⊃ C} (and so, with line 1, {A ⊃ B}) has been shown.',
    },
  ],
  margin: {
    title: 'Conditionalization',
    body: [
      'The Stoics tied validity to the conditional directly. Sextus reports their test: an argument is conclusive when the conditional that has the conjunction of its premises as antecedent and its conclusion as consequent is sound. Conditional proof runs this link in the other direction: if the premises plus {p} yield {q}, the premises yield {p ⊃ q}.',
      'In modern logic this is the **deduction theorem**, proved for axiomatic systems by Herbrand in his 1930 thesis and, independently, by Tarski. In natural deduction systems it is built in as a rule, which is what makes those systems “natural”: Jaśkowski’s 1934 paper is titled *On the Rules of Suppositions*.',
    ],
    sources: ['sextusPH', 'herbrand1930', 'jaskowski1934', 'ndSEP', 'hurley2018'],
  },
};
