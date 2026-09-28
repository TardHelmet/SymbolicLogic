const DAY = { D: 'it is day', L: 'it is light' };

export default {
  id: 'implication',
  title: 'Implication beyond the horseshoe',
  hurley: 'beyond Hurley',
  card: 'Strict, relevant and connexive conditionals: three attempts to capture “follows from” better than ⊃ does.',
  summary: 'The horseshoe makes a false statement imply anything and a true one follow from anything. Three families of logic try to do better, and each pays a price. The ancient debate from {@truth-functions} was never settled; it moved into these logics.',
  reading: [
    { h: 'The paradoxes of material implication' },
    'Each of these is a tautology, and each sounds wrong if ⊃ is read as “implies”:',
    { list: [
      '{A ⊃ (B ⊃ A)}: a true statement is implied by anything.',
      '{~A ⊃ (A ⊃ B)}: a false statement implies anything.',
      '{(A ⊃ B) ∨ (B ⊃ A)}: of any two statements, one implies the other.',
    ] },
    { h: 'Strict implication' },
    'C. I. Lewis proposed that “A implies B” should mean that it is *impossible* for A to be true and B false: {□(A ⊃ B)}, strict implication. In {@possible-worlds}’s terms, B is true at every accessible world where A is. This removes the paradoxes above: a merely false A no longer strictly implies everything. Its descendant is Diodorus’s criterion from {@truth-functions}.',
    'But strict implication has paradoxes of its own. An *impossible* statement strictly implies everything, since {□~A ⊃ □(A ⊃ B)} is valid, and a necessary statement is strictly implied by everything. Lewis accepted these, and gave the Add-then-DS derivation of explosion ({@indirect-proof}) to show they are unavoidable.',
    { h: 'Relevance' },
    'Anderson and Belnap answered that Lewis’s derivation is exactly where things go wrong. A conclusion must be *relevant* to its premises. A minimal test: in a valid implication, premise and conclusion must share a statement letter. {A • ~A / B} fails the test, and so does {A / B ∨ ~B}.',
    'Variable sharing is necessary for relevance but not sufficient. Disjunctive syllogism shares letters between premises and conclusion, and relevance logics still reject it as a general rule, because it is the step that turns a contradiction into anything. {@^three-values} found the same step failing in LP.',
    { h: 'Connexive implication' },
    'A third tradition asks the conditional to respect a kind of coherence. **Aristotle’s thesis**: no statement is implied by its own negation, {~(~A → A)}. **Boethius’s thesis**: if A implies B, then A does not imply not-B, {(A → B) → ~(A → ~B)}. Both sound obvious. Both fail for the horseshoe: {~(~A ⊃ A)} is false whenever A is true, and Boethius’s thesis fails whenever A is false. Connexive logics make them valid, at the price of other classical laws. The Stoic criterion of *connection*, that the negation of the consequent must conflict with the antecedent, is connexive in spirit.',
  ],
  exercises: [
    { id: 'im-p1', type: 'classify', mode: 'statement', prompt: 'A paradox of material implication. Classify {(A ⊃ B) ∨ (B ⊃ A)}.', formulas: ['(A ⊃ B) ∨ (B ⊃ A)'] },
    { id: 'im-strict', type: 'translate', modal: true, prompt: 'Symbolize: “That it is day strictly implies that it is light.”', dictionary: DAY, key: '□(D ⊃ L)', wrong: ['D ⊃ □L', 'D ⊃ L'] },
    { id: 'im-k1', type: 'kripke', logic: 'K', question: 'countermodel', prompt: 'A true material conditional need not be a strict one. Build a K model where {A ⊃ B} is true at a world but {□(A ⊃ B)} is not.', argument: 'A ⊃ B / □(A ⊃ B)' },
    { id: 'im-k2', type: 'kripke', logic: 'K', question: 'validity', prompt: 'A paradox of strict implication: does an impossibility strictly imply everything?', argument: '□~A / □(A ⊃ B)' },
    { id: 'im-k3', type: 'kripke', logic: 'K', question: 'validity', prompt: 'Is strict implication transitive?', argument: '□(A ⊃ B), □(B ⊃ C) / □(A ⊃ C)' },
    { id: 'im-aristotle', type: 'classify', mode: 'statement', prompt: 'Aristotle’s thesis, with the horseshoe. Classify {~(~A ⊃ A)}.', formulas: ['~(~A ⊃ A)'] },
    { id: 'im-boethius', type: 'classify', mode: 'statement', prompt: 'Boethius’s thesis, with the horseshoe. Classify {(A ⊃ B) ⊃ ~(A ⊃ ~B)}.', formulas: ['(A ⊃ B) ⊃ ~(A ⊃ ~B)'] },
    {
      id: 'im-share', type: 'choice', prompt: 'Which of these classically valid arguments fail the variable-sharing test?',
      options: ['{A • ~A / B}', '{A ⊃ B, A / B}', '{A / B ∨ ~B}', '{A / A ∨ B}'],
      answer: [0, 2],
      explain: 'In the first and third, no letter of the premises appears in the conclusion.',
    },
    {
      id: 'im-ds', type: 'choice', prompt: 'Disjunctive syllogism, {A ∨ B, ~A / B}, passes the variable-sharing test. Why do relevance logicians still reject it as a general rule?',
      options: ['Because it is invalid in classical logic.', 'Because, combined with Add, it derives any statement from a contradiction.', 'Because its premises are never true.'],
      answer: 1,
      explain: 'Lewis’s derivation of explosion is Add then DS. Keep Add, which is plainly relevant-safe, and something must give: relevance logic gives up DS as a rule.',
    },
  ],
  margin: {
    title: 'The crows are still cawing',
    body: [
      'Lewis first proposed strict implication in 1912, as the paper cited in {@truth-functions} shows, and developed it with Langford in *Symbolic Logic* (1932), where the modal systems S1 to S5 were introduced. Anderson and Belnap’s *Entailment* (1975) made relevance logic a research program; Mares’s encyclopedia entry explains its semantics.',
      'Connexive logic was named by McCall in 1966, reviving theses found in Aristotle (*Prior Analytics* II.4) and Boethius. Wansing surveys the modern systems. The Stoic criterion of connection reported by Sextus ({@truth-functions}) is often cited as their ancestor. Philo’s conditional won the textbooks; the others survived as the logics of this lesson.',
    ],
    sources: ['lewis1912', 'lewisLangford1932', 'andersonBelnap1975', 'relevanceSEP', 'mccall1966', 'connexiveSEP', 'aristotlePrA', 'sextusM'],
  },
};
