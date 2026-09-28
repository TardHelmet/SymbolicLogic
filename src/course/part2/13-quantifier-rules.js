export default {
  id: 'quantifier-rules',
  title: 'Proofs with quantifiers',
  hurley: '§8.2',
  card: 'UI, EI, UG and EG: taking quantifiers off, working in sentential logic, and putting them back on.',
  summary: 'Four rules let proofs pass between quantified statements and their instances. The whole difficulty lies in their restrictions, and each restriction blocks a specific bad inference.',
  reading: [
    { h: 'The strategy' },
    'Remove the quantifiers with the instantiation rules, reason about the instances with the eighteen rules you already know, then put quantifiers back with the generalization rules.',
    { rules: ['UI', 'EI', 'UG', 'EG'] },
    { h: 'Universal instantiation (UI)' },
    'What holds of everything holds of any particular thing. From {(x)(Fx ⊃ Gx)} infer {Fa ⊃ Ga}, or {Fy ⊃ Gy}. Every free x must be replaced by the same name or variable.',
    { proof: `1. (x)(Hx ⊃ Mx)
2. Hs            / Ms
3. Hs ⊃ Ms       1, UI
4. Ms            3, 2, MP` },
    { h: 'Existential generalization (EG)' },
    'What holds of a particular thing holds of something. From {Ga • Ha} infer {(∃x)(Gx • Hx)}. EG is safe with names and variables alike.',
    { h: 'Existential instantiation (EI)' },
    'From {(∃x)Fx} we may give the thing that is F a temporary name, and infer {Fa}. But the name must be **new**: it must not appear earlier in the proof or in the conclusion. Otherwise we would be assuming, with no warrant, that the F is some individual we already know about.',
    { example: 'Why the name must be new', steps: [
      'From “some philosophers are Stoics” and “some philosophers are Epicureans”, nothing follows about any one philosopher being both.',
      'EI to a on the first gives {Pa • Sa}. If EI to a were allowed again on the second, it would give {Pa • Ea}, and then {(∃x)(Sx • Ex)} would follow: someone is both a Stoic and an Epicurean.',
      'The second EI must use a new name, b, and then no such conclusion follows.',
    ], stepwise: true },
    'So when a proof needs both EI and UI, **do EI first**: a universal can be instantiated to any name, including the one EI just introduced, but not the other way round.',
    { proof: `1. (x)(Fx ⊃ Gx)
2. (∃x)Fx        / (∃x)Gx
3. Fa            2, EI
4. Fa ⊃ Ga       1, UI
5. Ga            4, 3, MP
6. (∃x)Gx        5, EG` },
    { h: 'Universal generalization (UG)' },
    'From {Fy} infer {(x)Fx}, but only when y is a *variable* standing for an arbitrary individual. Three restrictions keep it honest:',
    { list: [
      '**Never from a name.** {Fa} says something about one individual; UG on a is not allowed.',
      '**Not inside an indented sequence whose assumption has the variable free.** If you have assumed {Fy} for conditional proof, y is not arbitrary inside that sequence: it is whatever you assumed to be F.',
      '**Not on a variable free in a line obtained by EI.** If EI gave {Lya}, then a was chosen for y, and y is no longer arbitrary. This blocks the classic fallacy of moving “everyone loves someone” to “someone is loved by everyone.”',
    ] },
    { proof: `1. (x)(Fx ⊃ Gx)
2. (x)(Gx ⊃ Hx)     / (x)(Fx ⊃ Hx)
3. Fy ⊃ Gy          1, UI
4. Gy ⊃ Hy          2, UI
5. Fy ⊃ Hy          3, 4, HS
6. (x)(Fx ⊃ Hx)     5, UG` },
    'Here y is arbitrary: nothing about it was assumed, and it was not introduced by EI, so what holds of it holds of everything.',
  ],
  exercises: [
    { id: 'qr-1', type: 'proof', prompt: 'Prove the conclusion.', argument: '(x)(Hx ⊃ Mx), Hs / Ms', solution: [['Hs ⊃ Ms', '1, UI'], ['Ms', '3, 2, MP']] },
    { id: 'qr-2', type: 'proof', prompt: 'Prove the conclusion.', argument: '(x)(Fx • Gx) / (x)Fx', solution: [['Fy • Gy', '1, UI'], ['Fy', '2, Simp'], ['(x)Fx', '3, UG']] },
    { id: 'qr-3', type: 'proof', prompt: 'Prove the conclusion.', argument: '(∃x)(Fx • Gx) / (∃x)Fx', solution: [['Fa • Ga', '1, EI'], ['Fa', '2, Simp'], ['(∃x)Fx', '3, EG']] },
    { id: 'qr-4', type: 'proof', prompt: 'Prove the conclusion (a syllogism in the mood Barbara).', argument: '(x)(Fx ⊃ Gx), (x)(Gx ⊃ Hx) / (x)(Fx ⊃ Hx)',
      solution: [['Fy ⊃ Gy', '1, UI'], ['Gy ⊃ Hy', '2, UI'], ['Fy ⊃ Hy', '3, 4, HS'], ['(x)(Fx ⊃ Hx)', '5, UG']] },
    { id: 'qr-5', type: 'proof', prompt: 'Prove the conclusion. Remember: EI before UI.', argument: '(x)(Fx ⊃ Gx), (∃x)(Fx • Hx) / (∃x)(Gx • Hx)',
      solution: [['Fa • Ha', '2, EI'], ['Fa ⊃ Ga', '1, UI'], ['Fa', '3, Simp'], ['Ga', '4, 5, MP'], ['Ha • Fa', '3, Com'], ['Ha', '7, Simp'], ['Ga • Ha', '6, 8, Conj'], ['(∃x)(Gx • Hx)', '9, EG']] },
    { id: 'qr-6', type: 'proof', prompt: 'Supply the justifications.', argument: '(x)(Sx ⊃ ~Ex), (∃x)(Px • Sx) / (∃x)(Px • ~Ex)', mode: 'justify',
      solution: [['Pa • Sa', '2, EI'], ['Sa ⊃ ~Ea', '1, UI'], ['Sa • Pa', '3, Com'], ['Sa', '5, Simp'], ['~Ea', '4, 6, MP'], ['Pa', '3, Simp'], ['Pa • ~Ea', '8, 7, Conj'], ['(∃x)(Px • ~Ex)', '9, EG']] },
    { id: 'qr-7', type: 'proof', prompt: 'Prove the conclusion.', argument: '(x)(Fx ⊃ Gx), (x)(Gx ⊃ Hx), Fa / (∃x)Hx',
      solution: [['Fa ⊃ Ga', '1, UI'], ['Ga ⊃ Ha', '2, UI'], ['Fa ⊃ Ha', '4, 5, HS'], ['Ha', '6, 3, MP'], ['(∃x)Hx', '7, EG']] },
    { id: 'qr-8', type: 'proof', prompt: 'Prove the conclusion.', argument: '(x)[Fx ⊃ (Gx • Hx)] / (x)(Fx ⊃ Hx)',
      solution: [['Fy ⊃ (Gy • Hy)', '1, UI'], ['Fy', 'ACP'], ['Gy • Hy', '2, 3, MP'], ['Hy • Gy', '4, Com'], ['Hy', '5, Simp'], ['Fy ⊃ Hy', '3–6, CP'], ['(x)(Fx ⊃ Hx)', '7, UG']] },
    {
      id: 'qr-flag-1', type: 'flag-step', prompt: 'This “proof” that something is both a Stoic and an Epicurean is flawed. Which line breaks a rule?',
      argument: '(∃x)Sx, (∃x)Ex / (∃x)(Sx • Ex)',
      lines: [['Sa', '1, EI'], ['Ea', '2, EI'], ['Sa • Ea', '3, 4, Conj'], ['(∃x)(Sx • Ex)', '5, EG']],
    },
    {
      id: 'qr-flag-2', type: 'flag-step', prompt: 'This “proof” moves from one Stoic to all of them. Which line breaks a rule?',
      argument: 'Sc / (x)Sx',
      lines: [['(x)Sx', '1, UG']],
    },
    {
      id: 'qr-flag-3', type: 'flag-step', prompt: '“Everyone loves someone, so someone is loved by everyone.” Which line breaks a rule?',
      argument: '(x)(∃y)Lxy / (∃y)(x)Lxy',
      lines: [['(∃y)Lxy', '1, UI'], ['Lxa', '2, EI'], ['(x)Lxa', '3, UG'], ['(∃y)(x)Lxy', '4, EG']],
    },
  ],
  margin: {
    title: 'The arbitrary triangle',
    body: [
      'UG formalizes an old pattern of proof. Euclid proves that the angles of *a* triangle sum to two right angles by reasoning about one drawn triangle, and concludes that this holds of every triangle. The step is legitimate only if nothing was assumed about that triangle beyond its being a triangle.',
      'Berkeley used exactly this point against abstract general ideas. A demonstration about a particular triangle is general, he argued, not because it concerns an abstract triangle that is neither equilateral nor scalene, but because none of the particular features of the drawn triangle were used in the proof.',
      'In a proof with UG, y plays the part of the drawn triangle, and the restrictions make sure that nothing particular about y was used. Kit Fine’s *Reasoning with Arbitrary Objects* took the older idea literally, as a theory of arbitrary objects that have just the properties common to all things of their kind.',
    ],
    sources: ['berkeley1710', 'fine1985', 'hurley2018'],
  },
};
