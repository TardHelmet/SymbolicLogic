export default {
  id: 'indirect-proof',
  title: 'Indirect proof and logical truths',
  refs: { copiIL: '§9.12', copiSL: '§§3.5–3.6', hurley: '§§7.6–7.7' },
  card: 'Reductio ad absurdum: assume the opposite, derive a contradiction. And proofs with no premises at all.',
  summary: 'To prove something, assume its negation and show that a contradiction follows. The assumption must then be false. This is the oldest proof method in mathematics and philosophy.',
  reading: [
    { h: 'The method' },
    'To prove {p}, add its denial, {~p}, as an assumption (Copi writes “Assumption (I.P.)”; you may type AIP). Then derive an **explicit contradiction**, a line of the form {q • ~q}. At that point the proof is finished: Copi writes nothing further.',
    { proof: `1. A ∨ B
2. A ⊃ C
3. B ⊃ C          / C
4. ~C             AIP
5. ~A             2, 4, MT
6. B              1, 5, DS
7. C              3, 6, MP
8. C • ~C         7, 4, Conj` },
    'Why is it valid? The sequence shows that the premises together with the assumption lead to a contradiction, which is false in every situation. So there is no situation in which the premises and the assumption are all true. Wherever the premises are true, the assumption is false, and its negation true.',
    'Indirect proof is especially useful when the conclusion is a negation, or an atomic statement that appears nowhere in a convenient place, or when you are simply stuck. When the conclusion is a negation, {~p}, it is natural to assume {p} itself rather than {~~p}; the course accepts either.',
    { h: 'Reductio inside a proof' },
    'Copi’s form proves a whole argument at once. Sometimes a reductio is needed in the middle of a proof, to get one line that later steps use. Then the assumption is **discharged**: close the sequence and write the negation of the assumption, citing the whole sequence with I.P., as in “4–8, I.P.”. If the assumption was {~p}, that gives {~~p}, and D.N. gives {p}. This is the form Hurley teaches for every indirect proof; Copi’s *Symbolic Logic* reaches the same result through conditional proof. As with conditional proof, lines inside a closed sequence may not be cited later.',
    { proof: `1. A ∨ B
2. A ⊃ C
3. B ⊃ C          / C • (A ∨ B)
4. ~C             AIP
5. ~A             2, 4, MT
6. B              1, 5, DS
7. C              3, 6, MP
8. C • ~C         7, 4, Conj
9. ~~C            4–8, IP
10. C             9, DN
11. C • (A ∨ B)   10, 1, Conj` },
    { h: 'Logical truths' },
    'A tautology follows from no premises at all: it is true in every situation. Conditional and indirect proof let us prove tautologies from nothing, by starting straight away with an assumption.',
    { proof: `/ A ∨ ~A
1. ~(A ∨ ~A)       AIP
2. ~A • ~~A        1, DM` },
    'The assumption in line 1 turns, by De M., straight into a contradiction of the form {q • ~q}, with {~A} for {q}. The law of excluded middle follows from nothing. (Copi’s own example of a proof of a tautology is this one, with B.)',
    { h: 'Explosion' },
    '{@^argument-tables} observed that inconsistent premises validly imply anything. Here is the proof, which uses no indirect reasoning at all:',
    { proof: `1. A • ~A          / B
2. A               1, Simp
3. ~A • A          1, Com
4. ~A              3, Simp
5. A ∨ B           2, Add
6. B               5, 4, DS` },
    'This is *ex contradictione quodlibet*: from a contradiction, anything. It is why indirect proof works (a contradiction is the worst thing a set of assumptions can lead to), and it is why classical logic cannot tolerate a single contradiction in a body of beliefs: one would make every statement provable. {@part:beyond} asks what happens in logics that block this derivation, and which step above they reject.',
  ],
  exercises: [
    { id: 'ip-1', type: 'proof', prompt: 'Prove by indirect proof.', argument: 'A ⊃ B, A ⊃ ~B / ~A',
      solution: [['A', 'AIP'], ['B', '1, 3, MP'], ['~B', '2, 3, MP'], ['B • ~B', '4, 5, Conj']] },
    { id: 'ip-2', type: 'proof', prompt: 'Prove by indirect proof.', argument: 'A ⊃ (B • ~B) / ~A',
      solution: [['A', 'AIP'], ['B • ~B', '1, 2, MP']] },
    { id: 'ip-3', type: 'proof', prompt: 'Prove the conclusion.', argument: '(A ∨ B) ⊃ (C • D), (D ∨ E) ⊃ ~A / ~A',
      solution: [['A', 'AIP'], ['A ∨ B', '3, Add'], ['C • D', '1, 4, MP'], ['D • C', '5, Com'], ['D', '6, Simp'], ['D ∨ E', '7, Add'], ['~A', '2, 8, MP'], ['A • ~A', '3, 9, Conj']] },
    { id: 'ip-4', type: 'proof', prompt: 'Prove the logical truth from no premises.', argument: '/ ~(A • ~A)',
      solution: [['A • ~A', 'AIP'], ['~(A • ~A)', '1–1, IP']] },
    { id: 'ip-5', type: 'proof', prompt: 'Prove the logical truth from no premises.', argument: '/ A ⊃ (B ⊃ A)',
      solution: [['A', 'ACP'], ['B', 'ACP'], ['~~A', '1, DN'], ['A', '3, DN'], ['B ⊃ A', '2–4, CP'], ['A ⊃ (B ⊃ A)', '1–5, CP']] },
    { id: 'ip-6', type: 'proof', prompt: 'Prove the logical truth from no premises.', argument: '/ [(A ⊃ B) • (B ⊃ C)] ⊃ (A ⊃ C)',
      solution: [['(A ⊃ B) • (B ⊃ C)', 'ACP'], ['A ⊃ B', '1, Simp'], ['(B ⊃ C) • (A ⊃ B)', '1, Com'], ['B ⊃ C', '3, Simp'], ['A ⊃ C', '2, 4, HS'], ['[(A ⊃ B) • (B ⊃ C)] ⊃ (A ⊃ C)', '1–5, CP']] },
    { id: 'ip-7', type: 'proof', prompt: 'A “paradox” of material implication, provable from nothing. (Indirect proof is the natural route.)', argument: '/ (A ⊃ B) ∨ (B ⊃ A)',
      solution: [['~[(A ⊃ B) ∨ (B ⊃ A)]', 'AIP'], ['~(A ⊃ B) • ~(B ⊃ A)', '1, DM'], ['~(A ⊃ B)', '2, Simp'], ['~(~A ∨ B)', '3, Impl'], ['~~A • ~B', '4, DM'], ['~B • ~~A', '5, Com'], ['~B', '6, Simp'], ['~(B ⊃ A) • ~(A ⊃ B)', '2, Com'], ['~(B ⊃ A)', '8, Simp'], ['~(~B ∨ A)', '9, Impl'], ['~~B • ~A', '10, DM'], ['~~B', '11, Simp'], ['~B • ~~B', '7, 12, Conj']] },
    { id: 'ip-8', type: 'proof', prompt: 'Supply the justifications.', argument: '~A ⊃ B, ~B / A', mode: 'justify',
      solution: [['~A', 'AIP'], ['B', '1, 3, MP'], ['B • ~B', '4, 2, Conj']] },
    { id: 'ip-9', type: 'proof', prompt: 'Prove explosion in the other direction: from {A} and {~A}, any {B}.', argument: 'A, ~A / B',
      solution: [['A ∨ B', '1, Add'], ['B', '3, 2, DS']] },
    {
      id: 'ip-contradiction', type: 'choice',
      prompt: 'Why must an indirect proof end its sequence with a line of the form {q • ~q}, rather than any line the prover believes false?',
      options: [
        'Because only a contradiction is false in every situation, so only it shows that the assumption cannot be true together with the premises.',
        'Because the dot is easier to work with.',
        'Because the textbook says so, and there is no deeper reason.',
      ],
      answer: 0,
      explain: 'Deriving a line that merely happens to be false would show nothing about validity. A contradiction is false on every row.',
    },
  ],
  margin: {
    title: 'Reductio',
    body: [
      'Arguing that a supposition leads to absurdity is older than logic as a discipline. Aristotle, discussing proof “through the impossible” in the *Prior Analytics*, gives the standard example: the diagonal of a square is incommensurable with its side, since if it were commensurable, odd numbers would equal even ones. The Eleatics before him argued this way against motion and plurality.',
      'The derivation of anything from a contradiction by Add and DS appears in C. I. Lewis and Langford’s *Symbolic Logic* (1932), and is sometimes called “Lewis’s independent argument”; versions go back to the twelfth century, to William of Soissons, and to the fourteenth-century author known as Pseudo-Scotus.',
      'Paraconsistent logics block it, usually by rejecting disjunctive syllogism. Priest, Tanaka and Weber survey the options. {@part:beyond} of this course lets you test the proof above against a paraconsistent truth table and find the step that fails.',
    ],
    sources: ['copiIL', 'copiSL', 'aristotlePrA', 'lewisLangford1932', 'paraconsistentSEP', 'kneale1962', 'hurley2018'],
  },
};
