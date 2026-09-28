export default {
  id: 'change-of-quantifier',
  title: 'Negated quantifiers, CP and IP',
  refs: { copiIL: '§10.4', copiSL: '§§4.4, 4.7', hurley: '§§8.3–8.4' },
  card: 'Quantifier negation, and conditional and indirect proof with quantifiers.',
  summary: 'The instantiation rules cannot touch a negated quantifier. Quantifier negation turns “not every” into “some … not”, and conditional and indirect proof work in predicate logic as they did before.',
  reading: [
    { h: 'Quantifier negation (Q.N.)' },
    '“Not everything is F” says the same as “something is not F”, and “nothing is F” says the same as “everything is not F”. Quantifier negation is a rule of replacement with four forms. Copi’s *Introduction to Logic* lists them as logical equivalences; his *Symbolic Logic* names the rule Q.N.; Hurley calls it change of quantifier, CQ. You may cite it as Q.N. or CQ.',
    { rules: ['CQ'] },
    'In words: move a tilde across a quantifier and the quantifier flips. These are the quantifier versions of De Morgan’s rule, and they are the contradictories of the square: {~(x)(Sx ⊃ Px)} is equivalent to {(∃x)~(Sx ⊃ Px)}, and so to {(∃x)(Sx • ~Px)}.',
    'UI and EI apply only to lines whose main operator is a quantifier. A line like {~(x)Fx} must first be turned into {(∃x)~Fx}, and then EI can be used.',
    { proof: `1. (x)(Fx ⊃ Gx)
2. ~(x)Gx          / ~(x)Fx
3. (∃x)~Gx         2, CQ
4. ~Ga             3, EI
5. Fa ⊃ Ga         1, UI
6. ~Fa             5, 4, MT
7. (∃x)~Fx         6, EG
8. ~(x)Fx          7, CQ` },
    { h: 'Conditional and indirect proof' },
    'CP and IP work exactly as before. The only new point is the UG restriction from {@quantifier-rules}: inside a sequence whose assumption has y free, UG may not generalize on y. After the sequence is closed, it may.',
    { proof: `1. (∃x)Fx ⊃ (x)Gx     / (x)(Fx ⊃ Gx)
2. Fy                 ACP
3. (∃x)Fx             2, EG
4. (x)Gx              1, 3, MP
5. Gy                 4, UI
6. Fy ⊃ Gy            2–5, CP
7. (x)(Fx ⊃ Gx)       6, UG` },
    'UG at line 7 is legitimate: the sequence that assumed {Fy} is closed, and {Fy ⊃ Gy} was proved for an arbitrary y.',
    { h: 'An assumption hidden in the rules' },
    'Classical predicate logic proves {(x)Fx ⊃ (∃x)Fx}: instantiate the universal to any name, then generalize existentially. This is valid because every model is assumed to contain at least one individual. A *free logic* drops that assumption; the margin of {@identity} returns to it.',
  ],
  exercises: [
    { id: 'cq-1', type: 'proof', prompt: 'Prove the conclusion.', argument: '~(x)Fx / (∃x)~Fx', solution: [['(∃x)~Fx', '1, CQ']] },
    { id: 'cq-2', type: 'proof', prompt: 'Prove the conclusion.', argument: '~(∃x)(Fx • ~Gx) / (x)(Fx ⊃ Gx)',
      solution: [['(x)~(Fx • ~Gx)', '1, CQ'], ['~(Fy • ~Gy)', '2, UI'], ['~Fy ∨ ~~Gy', '3, DM'], ['~Fy ∨ Gy', '4, DN'], ['Fy ⊃ Gy', '5, Impl'], ['(x)(Fx ⊃ Gx)', '6, UG']] },
    { id: 'cq-3', type: 'proof', prompt: 'Prove the conclusion.', argument: '(x)(Fx ⊃ Gx), ~(x)Gx / ~(x)Fx',
      solution: [['(∃x)~Gx', '2, CQ'], ['~Ga', '3, EI'], ['Fa ⊃ Ga', '1, UI'], ['~Fa', '5, 4, MT'], ['(∃x)~Fx', '6, EG'], ['~(x)Fx', '7, CQ']] },
    { id: 'cq-4', type: 'proof', prompt: 'Prove by conditional proof.', argument: '(x)(Fx ⊃ Gx) / (x)Fx ⊃ (x)Gx',
      solution: [['(x)Fx', 'ACP'], ['Fy', '2, UI'], ['Fy ⊃ Gy', '1, UI'], ['Gy', '4, 3, MP'], ['(x)Gx', '5, UG'], ['(x)Fx ⊃ (x)Gx', '2–6, CP']] },
    { id: 'cq-5', type: 'proof', prompt: 'Prove the conclusion.', argument: '(∃x)Fx ⊃ (x)Gx / (x)(Fx ⊃ Gx)',
      solution: [['Fy', 'ACP'], ['(∃x)Fx', '2, EG'], ['(x)Gx', '1, 3, MP'], ['Gy', '4, UI'], ['Fy ⊃ Gy', '2–5, CP'], ['(x)(Fx ⊃ Gx)', '6, UG']] },
    { id: 'cq-6', type: 'proof', prompt: 'Prove by indirect proof.', argument: '(x)(Fx ⊃ Gx), (x)(Fx ⊃ ~Gx) / ~(∃x)Fx',
      solution: [['(∃x)Fx', 'AIP'], ['Fa', '3, EI'], ['Fa ⊃ Ga', '1, UI'], ['Fa ⊃ ~Ga', '2, UI'], ['Ga', '5, 4, MP'], ['~Ga', '6, 4, MP'], ['Ga • ~Ga', '7, 8, Conj'], ['~(∃x)Fx', '3–9, IP']] },
    { id: 'cq-7', type: 'proof', prompt: 'Prove the logical truth.', argument: '/ (x)Fx ⊃ (∃x)Fx',
      solution: [['(x)Fx', 'ACP'], ['Fa', '1, UI'], ['(∃x)Fx', '2, EG'], ['(x)Fx ⊃ (∃x)Fx', '1–3, CP']] },
    { id: 'cq-8', type: 'proof', prompt: 'Prove the conclusion.', argument: '(x)(Fx ∨ Gx), ~(∃x)Gx / (x)Fx',
      solution: [['(x)~Gx', '2, CQ'], ['Fy ∨ Gy', '1, UI'], ['~Gy', '3, UI'], ['Gy ∨ Fy', '4, Com'], ['Fy', '6, 5, DS'], ['(x)Fx', '7, UG']] },
    {
      id: 'cq-flag', type: 'flag-step', prompt: 'This “proof” that whatever is F, everything is F is flawed. Which line breaks a rule?',
      argument: '/ (x)[Fx ⊃ (y)Fy]',
      lines: [['Fx', 'ACP'], ['(y)Fy', '1, UG'], ['Fx ⊃ (y)Fy', '1–2, CP'], ['(x)[Fx ⊃ (y)Fy]', '3, UG']],
    },
    {
      id: 'cq-glitters', type: 'readings',
      prompt: '“All that glitters is not gold” is ambiguous. Give both readings, with G for “x glitters” and O for “x is gold”.',
      dictionary: { G: 'x glitters', O: 'x is gold' },
      keys: ['(x)(Gx ⊃ ~Ox)', '~(x)(Gx ⊃ Ox)'],
    },
  ],
  margin: {
    title: 'Not all, all not',
    body: [
      '“All that glisters is not gold,” says the scroll in *The Merchant of Venice*, and means that not everything that glitters is gold. Read literally, the sentence says that nothing that glitters is gold. English lets negation and quantifiers combine ambiguously; predicate logic forces a choice of scope, and CQ records exactly how the choices are related.',
      'Laurence Horn’s *A Natural History of Negation* is the standard account of how negation behaves in natural languages, and of the long philosophical argument, back to Aristotle and the Stoics, over whether negative statements are as basic as affirmative ones. It is also a good guide to why “not all” so often conveys “some are not, and some are”, which logic does not say.',
    ],
    sources: ['copiIL', 'copiSL', 'horn1989', 'aristotleDeInt', 'hurley2018'],
  },
};
