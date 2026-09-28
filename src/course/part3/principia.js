// Matrices found by search (see axiomatic.js); each makes every axiom but one
// always take the designated value 0, and modus ponens preserves 0.
const PERM_MATRIX = { values: [0, 1, 2], designated: [0], not: [1, 2, 0], or: [[0, 0, 0], [0, 1, 2], [0, 0, 2]] };
const AX3_MATRIX = { values: [0, 1, 2], designated: [0], not: [1, 0, 0], and: [[0, 1, 0], [1, 1, 1], [1, 1, 1]] };

const T204 = '[p ⊃ (q ⊃ r)] ⊃ [q ⊃ (p ⊃ r)]';
const T205 = '(q ⊃ r) ⊃ [(p ⊃ q) ⊃ (p ⊃ r)]';

export default {
  id: 'principia',
  title: 'Principia and the axiomatic method',
  refs: { copiSL: 'chs. 8–9', langer: 'chs. XII–XIII' },
  card: 'Five axioms, one rule and substitution: proofs in the style of Principia Mathematica, independence by matrices, and other notations.',
  summary: 'Whitehead and Russell derived the whole of sentential logic from five primitive propositions, one rule and a definition. Proofs in their style are longer than Copi’s natural deductions and show something those do not: exactly which assumptions each law rests on.',
  reading: [
    { h: 'Assertion' },
    'Langer begins her account of *Principia Mathematica* with a distinction the Boolean algebra had blurred. When a proposition occurs inside another, it is not asserted: “it is merely talked about.” In {p ⊃ q}, neither p nor q is asserted, only the implication. Whitehead and Russell mark what is asserted with the sign ⊢, which goes back to Frege: {!⊢ p ⊃ q} asserts the implication, and nothing inside it. “We can never make, symbolically, assertions about assertions”, Langer adds: the assertion sign is the strongest symbol in the system, and what it means can only be said informally.',
    { h: 'The primitive propositions' },
    'The calculus rests on negation, disjunction and a definition, *1.01: {p ⊃ q} is to mean {~p ∨ q}. (Conjunction is defined later, *3.01, as {~(~p ∨ ~q)}.) One principle is informal, *1.1: anything implied by a true proposition is true. That is modus ponens. Then five formal ones, with the names Whitehead and Russell gave them:',
    { list: [
      '*1.2 Taut: {(p ∨ p) ⊃ p}',
      '*1.3 Add: {q ⊃ (p ∨ q)}',
      '*1.4 Perm: {(p ∨ q) ⊃ (q ∨ p)}',
      '*1.5 Assoc: {[p ∨ (q ∨ r)] ⊃ [q ∨ (p ∨ r)]}',
      '*1.6 Sum: {(q ⊃ r) ⊃ [(p ∨ q) ⊃ (p ∨ r)]}',
    ] },
    'Switch the notation at the top of the page to **Principia** to see them as they are printed there, with dots.',
    { h: 'Proof by substitution and detachment' },
    'A proof is a list of formulas, each an instance of an axiom, an instance of an earlier line, an earlier line rewritten by a definition, or the result of modus ponens. An **instance** comes from putting formulas for letters, the same formula for every occurrence of a letter. Langer’s derivation of *2.02, “a true proposition is implied by any proposition”:',
    { list: [
      '1. {q ⊃ (p ∨ q)}   *1.3',
      '2. {q ⊃ (~p ∨ q)}   Sub 1, with ~p for p',
      '3. {q ⊃ (p ⊃ q)}   Df 2, by *1.01',
    ] },
    'Nothing else is allowed: no assumptions, no conditional proof, no rule for the dot or the wedge. Every line is itself a theorem. That is the price of the method, and its point: each theorem shows exactly what it rests on. Herbrand’s deduction theorem ({@conditional-proof}) is what connects this style to Copi’s: whatever can be derived from an assumption A by the rules can be turned into an axiomatic proof of the conditional with A as antecedent.',
    { h: 'Redundancy and independence' },
    'Are all five primitive propositions needed? In 1926 Bernays showed that *1.5 is not: it can be derived from the other four. The remaining four are **independent**, and the proof uses the idea from {@postulates}: a system in which all the other axioms hold and the one in question does not. Here the systems are **matrices**, truth tables with more than two values. Choose some values as “designated” (the analogue of truth). If every axiom but one always takes a designated value, and modus ponens can never lead from designated values to an undesignated one, then everything provable from those axioms is always designated. If the remaining axiom is not, it cannot be proved from them. Copi proves the independence of the axioms of his system this way, and the matrices of {@three-values} are of the same kind.',
    { h: 'Other systems, other notations' },
    'Copi’s *Symbolic Logic* gives a system he takes from Rosser, R.S., with ~ and • as primitives and three axioms: {P ⊃ (P • P)}, {(P • Q) ⊃ P} and {(P ⊃ Q) ⊃ [~(Q • R) ⊃ ~(R • P)]}. Hilbert and Ackermann use Principia’s axioms without *1.5. Sheffer showed that a single connective, the stroke (“not both”), suffices for everything, and Nicod found a single axiom for it. Łukasiewicz wrote logic without brackets at all, putting each operator before its arguments: N not, K and, A or, C if, E if and only if. {(P • Q) ⊃ R} is {!CKpqr}; {P • (Q ⊃ R)} is {!KpCqr}.',
    { h: 'Logistics' },
    'The five primitive propositions were only the start. *Principia* went on to define classes, relations and numbers in logical terms and to derive arithmetic, the project Langer calls **logistics**. It gave the new logic of Boole, De Morgan and Peirce, she writes, “a definite goal, namely to construct a firm and universal foundation for the immense superstructure of mathematical reasoning”. It did not settle what logic is. Gödel showed in 1931 that no such system can prove every truth of arithmetic, if it is consistent.',
  ],
  exercises: [
    { id: 'pm-1', type: 'axiomatic', system: 'PM', prompt: 'Prove *2.02 from *1.3, as Langer does.', goal: 'q ⊃ (p ⊃ q)',
      solution: [['q ⊃ (p ∨ q)', '*1.3'], ['q ⊃ (~p ∨ q)', 'Sub 1'], ['q ⊃ (p ⊃ q)', 'Df 2']] },
    { id: 'pm-2', type: 'axiomatic', system: 'PM', mode: 'justify', prompt: '*2.03, a form of transposition, from *1.4. Supply the justifications.', goal: '(p ⊃ ~q) ⊃ (q ⊃ ~p)',
      solution: [['(p ∨ q) ⊃ (q ∨ p)', '*1.4'], ['(~p ∨ ~q) ⊃ (~q ∨ ~p)', 'Sub 1'], ['(p ⊃ ~q) ⊃ (~q ∨ ~p)', 'Df 2'], ['(p ⊃ ~q) ⊃ (q ⊃ ~p)', 'Df 3']] },
    { id: 'pm-3', type: 'axiomatic', system: 'PM', prompt: '*2.04, the commutative principle: “if r follows from q provided p is true, r follows from p provided q is true”. Use *1.5.', goal: T204,
      solution: [['[p ∨ (q ∨ r)] ⊃ [q ∨ (p ∨ r)]', '*1.5'], ['[~p ∨ (~q ∨ r)] ⊃ [~q ∨ (~p ∨ r)]', 'Sub 1'], ['[p ⊃ (q ⊃ r)] ⊃ [q ⊃ (p ⊃ r)]', 'Df 2']] },
    { id: 'pm-4', type: 'axiomatic', system: 'PM', prompt: '*2.05, one form of the syllogism, from *1.6.', goal: T205,
      solution: [['(q ⊃ r) ⊃ [(p ∨ q) ⊃ (p ∨ r)]', '*1.6'], ['(q ⊃ r) ⊃ [(~p ∨ q) ⊃ (~p ∨ r)]', 'Sub 1'], ['(q ⊃ r) ⊃ [(p ⊃ q) ⊃ (p ⊃ r)]', 'Df 2']] },
    { id: 'pm-5', type: 'axiomatic', system: 'PM', prompt: '*2.06, the syllogism with its premises in the other order. You may cite *2.04 and *2.05; one instance of *2.04 and one modus ponens are enough.', goal: '(p ⊃ q) ⊃ [(q ⊃ r) ⊃ (p ⊃ r)]',
      theorems: { '*2.04': T204, '*2.05': T205 },
      solution: [['[(q ⊃ r) ⊃ ((p ⊃ q) ⊃ (p ⊃ r))] ⊃ [(p ⊃ q) ⊃ ((q ⊃ r) ⊃ (p ⊃ r))]', '*2.04'], ['(q ⊃ r) ⊃ [(p ⊃ q) ⊃ (p ⊃ r)]', '*2.05'], ['(p ⊃ q) ⊃ [(q ⊃ r) ⊃ (p ⊃ r)]', 'MP 1, 2']] },
    { id: 'pm-6', type: 'axiomatic', system: 'PM', prompt: '*2.08: every proposition implies itself. Langer leaves this one to Principia, calling it “several steps”. Here is the route: an instance of *2.05, then *1.2 and *1.3, and modus ponens twice.', goal: 'p ⊃ p',
      theorems: { '*2.05': T205 },
      solution: [['[(p ∨ p) ⊃ p] ⊃ {[p ⊃ (p ∨ p)] ⊃ (p ⊃ p)}', '*2.05'], ['(p ∨ p) ⊃ p', '*1.2'], ['[p ⊃ (p ∨ p)] ⊃ (p ⊃ p)', 'MP 1, 2'], ['p ⊃ (p ∨ p)', '*1.3'], ['p ⊃ p', 'MP 3, 4']] },
    { id: 'pm-7', type: 'axiomatic', system: 'RS', prompt: 'Copi’s first theorem of R.S., the principle of non-contradiction, from Rosser’s three axioms.', goal: '~(~P • P)',
      solution: [['P ⊃ (P • P)', 'Ax. 1'], ['(P • P) ⊃ P', 'Ax. 2'], ['[P ⊃ (P • P)] ⊃ [~((P • P) • ~P) ⊃ ~(~P • P)]', 'Ax. 3'], ['~((P • P) • ~P) ⊃ ~(~P • P)', 'R1 1, 3'], ['~((P • P) • ~P)', 'Df 2'], ['~(~P • P)', 'R1 5, 4']] },
    { id: 'pm-ind-1', type: 'independence', system: 'PM', prompt: 'A three-valued matrix for Principia’s ~ and ∨, with 0 designated. Which primitive proposition does it show independent of the others?', matrix: PERM_MATRIX },
    { id: 'pm-ind-2', type: 'independence', system: 'RS', prompt: 'A matrix for R.S., with ~ and • as primitives and 0 designated. Which axiom does it show independent?', matrix: AX3_MATRIX },
    {
      id: 'pm-assert', type: 'choice', prompt: 'In {!⊢ p ⊃ q}, what is asserted?',
      options: ['That p implies q.', 'That p is true.', 'That q is true.', 'That p and q are both true.'],
      answer: 0,
      explain: 'Only the main connective’s relation is asserted: “p and q in themselves are not asserted”, as Langer puts it.',
    },
    {
      id: 'pm-bernays', type: 'choice', prompt: 'Bernays showed in 1926 that *1.5 can be derived from *1.2, *1.3, *1.4 and *1.6. What follows?',
      options: [
        'Dropping *1.5 leaves the same theorems.',
        'Dropping *1.5 loses the associative law.',
        '*1.5 is false.',
        'The other four are not independent.',
      ],
      answer: 0,
      explain: 'A derivable axiom is redundant: the theorems are the same with or without it. That is why Hilbert and Ackermann use only four.',
    },
    { id: 'pm-pol-1', type: 'polish', prompt: 'Write in Polish notation.', key: '(P • Q) ⊃ R' },
    { id: 'pm-pol-2', type: 'polish', prompt: 'Write *1.6, Sum, in Polish notation.', key: '(Q ⊃ R) ⊃ [(P ∨ Q) ⊃ (P ∨ R)]' },
    { id: 'pm-pol-3', type: 'translate', structural: true, prompt: 'Łukasiewicz wrote the syllogism as {!CCpqCCqrCpr}. Write it with brackets.', dictionary: {}, key: '(P ⊃ Q) ⊃ [(Q ⊃ R) ⊃ (P ⊃ R)]', wrong: ['[(P ⊃ Q) • (Q ⊃ R)] ⊃ (P ⊃ R)', '[(P ⊃ Q) ⊃ (Q ⊃ R)] ⊃ (P ⊃ R)'] },
    { id: 'pm-dots-1', type: 'translate', structural: true, prompt: 'Principia prints *1.6 as {%Q ⊃ R . ⊃ : P ∨ Q . ⊃ . P ∨ R}. Write it with brackets.', dictionary: {}, key: '(Q ⊃ R) ⊃ [(P ∨ Q) ⊃ (P ∨ R)]', wrong: ['[(Q ⊃ R) ⊃ (P ∨ Q)] ⊃ (P ∨ R)'] },
    { id: 'pm-dots-2', type: 'translate', structural: true, prompt: 'And *3.3, exportation: {%P . Q . ⊃ . R : ⊃ : P . ⊃ . Q ⊃ R}.', dictionary: {}, key: '[(P • Q) ⊃ R] ⊃ [P ⊃ (Q ⊃ R)]', wrong: ['[(P • Q) ⊃ R] ≡ [P ⊃ (Q ⊃ R)]', 'P • [Q ⊃ (R ⊃ (P ⊃ (Q ⊃ R)))]'] },
  ],
  margin: {
    title: 'The axiomatic ideal',
    body: [
      'Frege’s *Begriffsschrift* (1879) was the first axiomatic system of logic in the modern sense, and *Principia Mathematica* (1910–13) the most ambitious: it aimed to show that mathematics is logic. Its first two chapters, the ones Langer follows, derive the laws of sentential logic from the five primitive propositions. Linsky and Irvine’s encyclopedia entry describes the whole work.',
      'The primitive propositions were soon picked apart. Bernays proved *1.5 redundant and the rest independent, using three-valued matrices of the kind in the exercises. Sheffer’s stroke of 1913 allowed a single connective, and Nicod a single axiom; Łukasiewicz and the Warsaw school searched for the shortest axioms of all, and his bracket-free notation belongs to that work. Copi’s *Symbolic Logic* presents these systems side by side in its ninth chapter.',
      'The two styles of proof in this course embody two ideals of what logic is. Copi’s natural deduction, after Gentzen and Jaśkowski, follows the inferences people make, from assumptions. The axiomatic style, after Frege and Russell, is a theory: a few truths from which all the others follow. Langer, writing when natural deduction had not yet reached the textbooks, presented logic through postulate systems, as a science of form; Gentzen held that the rules which introduce a connective amount to its definition. Gödel’s incompleteness theorems of 1931 set a limit to what any system of axioms can capture of arithmetic; Raatikainen’s entry explains how.',
    ],
    sources: ['langer1937', 'whiteheadRussell1910', 'copiSL', 'rosser1953', 'bernays1926', 'sheffer1913', 'frege1879', 'principiaSEP', 'godelSEP', 'gentzen1935'],
  },
};
