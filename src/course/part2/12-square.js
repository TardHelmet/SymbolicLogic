const A = '(x)(Sx ⊃ Px)';
const E = '(x)(Sx ⊃ ~Px)';
const I = '(∃x)(Sx • Px)';
const O = '(∃x)(Sx • ~Px)';
const IMPORT = ['(∃x)Sx'];

export default {
  id: 'square',
  title: 'Contraries, contradictories and the square',
  refs: { copiIL: '§§5.5, 5.7', langer: 'app. A', hurley: '§§4.2–4.5' },
  card: 'The traditional square of opposition, and what happens to it when “all” no longer implies “some”.',
  summary: 'Two statements can be opposed in different ways. Contradictories cannot both be true or both be false; contraries cannot both be true but can both be false. The difference matters whenever someone denies a claim and thinks they have thereby asserted its opposite.',
  reading: [
    { h: 'Four categorical statements' },
    'Traditional logic classified statements about classes by *quantity* (universal or particular) and *quality* (affirmative or negative), and named them with vowels:',
    { list: [
      '**A**, universal affirmative: “All S are P.” {(x)(Sx ⊃ Px)}',
      '**E**, universal negative: “No S are P.” {(x)(Sx ⊃ ~Px)}',
      '**I**, particular affirmative: “Some S are P.” {(∃x)(Sx • Px)}',
      '**O**, particular negative: “Some S are not P.” {(∃x)(Sx • ~Px)}',
    ] },
    { h: 'The traditional square' },
    'Aristotle and his successors arranged these in a square and named the relations between corners.',
    { list: [
      '**Contradictories** (A and O; E and I): exactly one is true. They cannot both be true and cannot both be false.',
      '**Contraries** (A and E): they cannot both be true, but they can both be false. “All philosophers are Stoics” and “No philosophers are Stoics” are both false.',
      '**Subcontraries** (I and O): they cannot both be false, but they can both be true.',
      '**Subalternation** (A to I; E to O): the universal implies the particular below it.',
    ] },
    'Contrariety and contradiction are easy to confuse, and the confusion costs arguments. To refute “all S are P” you need only its contradictory, “some S are not P”; you do not need its contrary, “no S are P”, which says much more. And from the falsity of “all S are P” nothing follows about “no S are P”.',
    { h: 'Existential import' },
    'The traditional square assumes that every subject term refers to something: that there are S’s. Without that assumption three of the four relations fail. If there are no unicorns, “all unicorns are white” and “no unicorns are white” are both true (each conditional has a false antecedent for every x), so they are not contraries, and “some unicorns are white” is false, so A does not imply I.',
    'Modern logic, the **Boolean interpretation** in Copi’s phrase (Hurley’s “Boolean standpoint”), does not assume existential import for universal statements: {(x)(Sx ⊃ Px)} is true when nothing is S. Only the contradictories survive, since {(x)(Sx ⊃ Px)} and {(∃x)(Sx • ~Px)} are exact negations of each other. The traditional **Aristotelian standpoint** can be recovered by adding the premise {(∃x)Sx}, and the exercises below let you compare the two.',
    'Inferring “some S are P” from “all S are P” without that premise commits the **existential fallacy**.',
    { h: 'Conversion' },
    'Switching subject and predicate preserves truth for E and I (“no S are P” is equivalent to “no P are S”), but not for A: “all Stoics are philosophers” does not mean “all philosophers are Stoics”.',
  ],
  exercises: [
    { id: 'sq-1', type: 'classify', mode: 'opposition', prompt: 'How are A and O related? (No existential assumption.)', formulas: [A, O] },
    { id: 'sq-2', type: 'classify', mode: 'opposition', prompt: 'How are A and E related, assuming there are S’s?', formulas: [A, E], given: IMPORT },
    { id: 'sq-3', type: 'classify', mode: 'opposition', prompt: 'How are A and E related, with no existential assumption?', formulas: [A, E] },
    { id: 'sq-4', type: 'classify', mode: 'opposition', prompt: 'How are I and O related, assuming there are S’s?', formulas: [I, O], given: IMPORT },
    { id: 'sq-5', type: 'classify', mode: 'opposition', prompt: 'How are A and I related, assuming there are S’s?', formulas: [A, I], given: IMPORT },
    { id: 'sq-6', type: 'classify', mode: 'opposition', prompt: 'How are E and I related?', formulas: [E, I] },
    { id: 'sq-7', type: 'classify', mode: 'opposition', prompt: 'How are these related? (Conversion of E.)', formulas: [E, '(x)(Px ⊃ ~Sx)'] },
    { id: 'sq-8', type: 'classify', mode: 'opposition', prompt: 'How are these related? (Conversion of A.)', formulas: [A, '(x)(Px ⊃ Sx)'] },
    {
      id: 'sq-fallacy', type: 'classify', mode: 'argument', prompt: '“All unicorns are white. So some unicorns are white.” Valid, from the Boolean standpoint?',
      dictionary: { U: 'x is a unicorn', W: 'x is white' }, argument: '(x)(Ux ⊃ Wx) / (∃x)(Ux • Wx)',
    },
    {
      id: 'sq-world', type: 'countermodel', prompt: 'Build a world in which “All S are P” and “No S are P” are both true.',
      formulas: [A, E], maxSize: 3,
    },
    {
      id: 'sq-refute', type: 'choice',
      prompt: 'Someone claims “All pleasures are good.” What must you establish to refute the claim?',
      options: ['That no pleasures are good.', 'That some pleasures are not good.', 'That some pleasures are good.'],
      answer: 1,
      why: ['That is the contrary: it would refute the claim, but it says far more than you need.', null, 'That is consistent with the claim.'],
      explain: 'The contradictory of an A statement is the O statement. One bad pleasure is enough.',
    },
  ],
  margin: {
    title: 'The greatest difference',
    body: [
      'Aristotle distinguished the two oppositions in *De Interpretatione*: “every man is white” and “no man is white” are contraries, and cannot both be true; “every man is white” and “not every man is white” are contradictories, and one of them must be true. In the *Metaphysics* he calls contrariety the *greatest* difference between things in the same genus, the difference between extremes like white and black, while contradiction admits no intermediate at all.',
      'The square was first drawn as a diagram in late antiquity, in the Latin tradition that runs through Apuleius and Boethius. Its status has been contested since the Middle Ages, when logicians noticed that empty subject terms break it. Parsons’s encyclopedia entry traces the history and argues that the medieval square, read with its own conventions for negative statements, did not assume that terms are non-empty.',
      'Whether a claim is opposed to its contrary or its contradictory is often the whole question in a philosophical dispute. Much depends on whether “not good” means “bad” or merely “other than good”.',
    ],
    sources: ['copiIL', 'langer1937', 'aristotleDeInt', 'aristotleMet', 'squareSEP', 'kneale1962', 'hurley2018'],
  },
};
