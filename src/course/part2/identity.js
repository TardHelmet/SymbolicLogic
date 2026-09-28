const STOA = { S: 'x is a Stoic', R: 'x is Roman', F: 'x founded the Stoa', C: 'x came from Cyprus', W: 'x is wiser than y', c: 'Chrysippus' };

export default {
  id: 'identity',
  title: 'Identity and descriptions',
  refs: { copiSL: '§5.4', hurley: '§8.7' },
  card: 'The identity sign, counting with quantifiers, “the”, and when two things are one.',
  summary: 'Adding one relation, identity, lets predicate logic count (“at least two”, “exactly one”), say “only” and “other than”, and analyse definite descriptions like “the founder of the Stoa.”',
  reading: [
    { h: 'The identity sign' },
    '{a = b} says that a and b are the same individual: “Tully is Cicero.” {~(a = b)}, also written a ≠ b, says they are distinct. Identity is reflexive, symmetric and transitive, and it has one further property that defines it: whatever is true of a is true of b if {a = b}.',
    { rules: ['Id'] },
    'These are Copi’s four forms. The first is the principle of the **indiscernibility of identicals**, often called Leibniz’s Law: given an identity, either name may replace the other. The second is the same principle turned around: things that differ in a property are distinct. The last two say that identity is symmetric and reflexive.',
    'Copi’s example: George Eliot wrote *The Mill on the Floss*; George Eliot is Mary Ann Evans; Mary Ann Evans is a woman; so a woman wrote *The Mill on the Floss*. With {Axy} for “x wrote y”, {Wx} for “x is a woman”, and g, m, f for the three names:',
    { proof: `1. Agf
2. g = m
3. Wm              / (∃x)(Wx • Axf)
4. Wg              2, 3, Id
5. Wg • Agf        4, 1, Conj
6. (∃x)(Wx • Axf)  5, EG` },
    'Line 4 puts g for m, the name on the right of the identity. Hurley’s substitution rule works only from left to right, so a proof in his system would first turn the identity around, {m = g}, by symmetry.',
    { h: 'Counting' },
    { list: [
      '**At least one F**: {(∃x)Fx}.',
      '**At least two**: {(∃x)(∃y)[(Fx • Fy) • ~(x = y)]}. Without {~(x = y)}, x and y could be the same thing.',
      '**At most one**: {(x)(y)[(Fx • Fy) ⊃ x = y]}. Any F’s you pick are the same one.',
      '**Exactly one**: at least one and at most one: {(∃x)[Fx • (y)(Fy ⊃ y = x)]}.',
    ] },
    'Identity also handles “only” and “other than” with names. “Chrysippus is wiser than every other Stoic” is {(x)[(Sx • ~(x = c)) ⊃ Wcx]}: without the clause “other than”, it would say he is wiser than himself.',
    { h: 'Definite descriptions' },
    '“The founder of the Stoa came from Cyprus.” “The founder” is not a name, but it seems to pick out one individual. Russell proposed that the sentence is really a claim about existence and uniqueness: there is exactly one founder of the Stoa, and it came from Cyprus.',
    { display: '(∃x)[(Fx • (y)(Fy ⊃ y = x)) • Cx]' },
    'Russell’s analysis dissolves an old puzzle. “The present King of France is bald” is not about a non-existent king; it says that there is exactly one present King of France and he is bald, which is simply false, since there is none. And “the present King of France is not bald” has two readings. On one, there is exactly one king and he is not bald (false again). On the other, it is not the case that there is exactly one king who is bald (true). The negation can take wide or narrow scope.',
    { h: 'Identity of indiscernibles' },
    'Leibniz’s Law says identical things share all properties. Its converse, that things sharing all properties are identical, is the **identity of indiscernibles**, and it is not a law of logic. One of the exercises asks you to build a world with two distinct individuals that no predicate tells apart.',
  ],
  exercises: [
    { id: 'id-1', type: 'translate', prompt: 'Symbolize: “Tully is Cicero.”', dictionary: { t: 'Tully', c: 'Cicero' }, key: 't = c' },
    { id: 'id-2', type: 'translate', prompt: 'Symbolize: “There are at least two Stoics.”', dictionary: STOA, key: '(∃x)(∃y)[(Sx • Sy) • ~(x = y)]', wrong: ['(∃x)(∃y)(Sx • Sy)'] },
    { id: 'id-3', type: 'translate', prompt: 'Symbolize: “There is at most one founder of the Stoa.”', dictionary: STOA, key: '(x)(y)[(Fx • Fy) ⊃ x = y]' },
    { id: 'id-4', type: 'translate', prompt: 'Symbolize: “Exactly one person founded the Stoa.” (The domain is people.)', dictionary: STOA, key: '(∃x)[Fx • (y)(Fy ⊃ y = x)]', alternatives: ['(∃x)Fx • (x)(y)[(Fx • Fy) ⊃ x = y]'] },
    { id: 'id-5', type: 'translate', prompt: 'Symbolize, following Russell: “The founder of the Stoa came from Cyprus.”', dictionary: STOA, key: '(∃x)[(Fx • (y)(Fy ⊃ y = x)) • Cx]' },
    { id: 'id-6', type: 'translate', prompt: 'Symbolize: “Chrysippus is wiser than every other Stoic.”', dictionary: STOA, key: '(x)[(Sx • ~(x = c)) ⊃ Wcx]', wrong: ['(x)(Sx ⊃ Wcx)'] },
    { id: 'id-7', type: 'translate', prompt: 'Symbolize: “Only Chrysippus is a Stoic.” (He is one, and nothing else is.)', dictionary: STOA, key: 'Sc • (x)(Sx ⊃ x = c)' },
    { id: 'id-p-1', type: 'proof', prompt: 'Prove that identity is transitive (for these names).', argument: 'a = b, b = c / a = c', solution: [['a = c', '1, 2, Id']] },
    { id: 'id-p-2', type: 'proof', prompt: 'Prove the conclusion.', argument: '(x)(Fx ⊃ x = a), Fb / b = a', solution: [['Fb ⊃ b = a', '1, UI'], ['b = a', '3, 2, MP']] },
    { id: 'id-p-3', type: 'proof', prompt: 'Copi’s wig: “Only a bald man wears a wig. Kaplan is a man who wears a wig. This man is not bald. Therefore this man is not Kaplan.” Prove it; the last step uses the second form of Id.', argument: '(x)[(Mx • Wx) ⊃ Bx], Mk • Wk, ~Bt / ~(t = k)',
      dictionary: { M: 'x is a man', W: 'x wears a wig', B: 'x is bald' },
      solution: [['(Mk • Wk) ⊃ Bk', '1, UI'], ['Bk', '4, 2, MP'], ['~(t = k)', '3, 5, Id']] },
    { id: 'id-p-4', type: 'proof', prompt: 'Prove the conclusion.', argument: '(x)(x = a ⊃ Fx) / Fa', solution: [['a = a ⊃ Fa', '1, UI'], ['a = a', 'Id'], ['Fa', '2, 3, MP']] },
    { id: 'id-cm-1', type: 'countermodel', prompt: 'Build a world containing two distinct individuals, named a and b, that agree on both F and G. Identity of indiscernibles fails.',
      formulas: ['Fa ≡ Fb', 'Ga ≡ Gb', '~(a = b)'], maxSize: 3 },
    { id: 'id-cm-2', type: 'countermodel', prompt: 'On Russell’s analysis, “the king is bald” and “the king is not bald” (narrow-scope negation) can both be false. Build a world where they are.',
      dictionary: { K: 'x is a present King of France', B: 'x is bald' },
      formulas: ['~(∃x)[(Kx • (y)(Ky ⊃ y = x)) • Bx]', '~(∃x)[(Kx • (y)(Ky ⊃ y = x)) • ~Bx]'], maxSize: 3 },
    {
      id: 'id-frege', type: 'choice', prompt: '“Hesperus is Hesperus” is trivial; “Hesperus is Phosphorus” was an astronomical discovery. Yet if both are true, the names refer to the same planet. What did Frege conclude?',
      options: ['That names have a sense (a mode of presentation) as well as a reference.', 'That identity is a relation between names, not objects.', 'That the second statement is false.'],
      answer: 0,
      why: [null, 'Frege considered this view in 1879 and rejected it in 1892.', 'Both are true: both names refer to Venus.'],
      explain: 'The two names refer to the same object but present it differently, as the evening star and the morning star, so the statements differ in cognitive value.',
    },
  ],
  margin: {
    title: 'Sense, reference and what there is not',
    body: [
      'Frege opened “On Sense and Reference” (1892) with the puzzle of informative identities. If “a = b” is true, it seems to say the same as “a = a”; yet one is a discovery and the other trivial. His answer divides what an expression contributes into its *reference* (the object) and its *sense*, the way the object is presented. Sense also carries the Stoic question from {@arguments} into modern logic: what is said, as distinct from what it is said about.',
      'Russell’s “On Denoting” (1905) took aim at Meinong, who held that “the golden mountain” and even “the round square” denote objects that have properties though they do not exist. Russell’s theory of descriptions paraphrases them away, so that no object is needed. Strawson replied in 1950 that “the present King of France is bald” is neither true nor false but has a failed presupposition, an early argument for truth-value gaps. {@part:beyond} gives gaps a logic.',
      'Meinong’s objects have had a revival; Reicher’s entry surveys the theories. *Free logics* drop the assumption that every name refers and every domain is non-empty, which {@change-of-quantifier} found built into the classical rules.',
      'Leibniz held that no two substances are exactly alike, and told of a gentleman at Herrenhausen who searched the gardens and failed to find two indistinguishable leaves. Black’s 1952 dialogue imagines a universe of just two qualitatively identical iron spheres as a counterexample. Forrest’s entry reviews the debate.',
    ],
    sources: ['copiSL', 'frege1892', 'russell1905', 'meinong1904', 'strawson1950', 'descriptionsSEP', 'nonexistentSEP', 'freeLogicSEP', 'leibnizDiscourse', 'leibnizClarke', 'black1952', 'indiscerniblesSEP', 'hurley2018'],
  },
};
