const HOUSES = {
  individuals: ['A', 'B', 'C', 'D'],
  names: { a: 'A', b: 'B', c: 'C', d: 'D' },
  relations: { N: [['A', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'C'], ['B', 'D'], ['C', 'D']] },
  glosses: { N: 'x is north of y' },
};

const CITIES = {
  individuals: ['Paris', 'Cologne', 'Berlin'],
  names: { p: 'Paris', c: 'Cologne', b: 'Berlin' },
  relations: { B: [['Cologne', 'Paris', 'Berlin'], ['Cologne', 'Berlin', 'Paris']] },
  glosses: { B: 'x is between y and z' },
};

export default {
  id: 'form',
  title: 'Logical form',
  refs: { copiIL: '§1.1', langer: 'chs. I–III' },
  card: 'What a form is, how it differs from content, and the elements, relations and contexts every logical system is built from.',
  summary: 'Logic studies form: not what things are made of, but how they are put together. Before any symbols, this lesson follows Langer’s opening chapters on form and content, abstraction and interpretation, and the relations that give a system its structure.',
  reading: [
    { h: 'Form' },
    '“The logical form of a thing”, Langer writes, “is the way that thing is constructed, the way it is put together.” A sonnet, a fugue, a genealogy and a railway timetable each have a form, and so do arguments. The rest of this course is about the forms of statements and of arguments, but the idea is older and wider than logic.',
    { h: 'Form and content' },
    'Langer quotes Russell’s account of the difference. Take the series “Socrates drank the hemlock”, “Coleridge drank the hemlock”, “Coleridge drank opium”, “Coleridge ate opium”. Every constituent has changed and the form has stayed the same. “Thus form is not another constituent, but is the way the constituents are put together.” You can know the form without knowing the constituents: whoever has never heard of Rorarius still understands “Rorarius drank the hemlock”.',
    { h: 'Analogy and the logical picture' },
    '“Analogy is nothing but the recognition of a common form in different things.” An architect’s drawing, a street plan and a chart of the stock market are what Langer calls **logical pictures**. They need not look like what they show; they share its form. That is why a diagram can be reasoned with, and why the same logic can apply to things as different as numbers, classes and propositions.',
    { h: 'Abstraction and interpretation' },
    'To consider a form apart from any content is **abstraction**. A couple of days, a pair of gloves, a brace of partridges and a set of twins share a form, their “numerosity”, two; speak of two without any of them and you have abstracted it. The reverse movement is **interpretation**: “Interpretation is the reverse of abstraction; the process of abstraction begins with a real thing and derives from it the bare form, or concept, whereas the process of interpretation begins with an empty concept and seeks some real thing which embodies it.” Every letter in this course is a place for interpretation: {A ⊃ B} is a form, and “if it is day, it is light” is one thing that embodies it.',
    { h: 'Elements, relations and degree' },
    'A structure has **elements** and **relations** among them. The elements a relation connects are its **terms**. “The most elementary characteristic of any relation is the number of terms it requires”: two for “north of”, three for “between” (Cologne is between Paris and Berlin; it cannot be simply “between Paris”). Langer calls this number the **degree** of the relation: dyadic, triadic, tetradic, and polyadic for relations like “among” with no fixed number. A property, such as “is wise”, behaves like a relation of one term.',
    { def: 'Degree in the notation of this course', text: 'A predicate letter is followed by as many names or variables as its relation has terms: {Wa} for “a is wise”, {Nab} for “a is north of b”, {Bcpb} for “c is between p and b”.' },
    { h: 'Formal context' },
    'Langer calls the frame within which a discussion moves its **formal context**: a collection of elements, K, and the relations that hold among them. Her example is a row of houses, A, B, C and D, with the single relation “north of”. Everything that can be said in that context is built from those elements and that relation. The formal context of a discussion, she adds, “may be agreed upon and expressed; the psychological context cannot.” The exercises below give you small formal contexts and ask what is true in them. Later lessons call them models.',
    { h: 'Why study forms' },
    'Langer ends her first chapter with two claims about logic. It is “the science of order *par excellence*”, since every science deals with patterns and logic studies them without the distractions of any particular case. And it is a tool: “Logic is to the philosopher what the telescope is to the astronomer: an instrument of vision.” Copi’s *Introduction to Logic* begins more plainly, with the study of the methods and principles used to tell good reasoning from bad. The next lesson shows how the two meet: an argument is good or bad in virtue of its form.',
  ],
  exercises: [
    {
      id: 'fm-degree-1', type: 'choice', prompt: 'Which of these relations are triadic (three terms)?',
      options: ['x is between y and z', 'x is north of y', 'x gives y to z', 'x is wise', 'x is among the y’s'],
      answer: [0, 2],
      why: [null, 'Two terms: “Montreal is north of Albany and New York” is two statements.', null, 'One term: a property.', 'No fixed number of terms: Langer calls such relations polyadic.'],
      explain: '“Between” and “gives … to …” need three terms to make sense.',
    },
    {
      id: 'fm-degree-2', type: 'choice', prompt: 'What is the degree of “x sells y to z for w”?',
      options: ['dyadic', 'triadic', 'tetradic', 'polyadic'],
      answer: 2,
      explain: 'Four terms: a seller, a thing sold, a buyer and a price.',
    },
    {
      id: 'fm-form-1', type: 'choice', prompt: 'Which of these share the logical form of “Socrates drank the hemlock”?',
      options: ['Coleridge ate opium.', 'Every Stoic drank water.', 'Socrates did not drink the hemlock.', 'Xanthippe married Socrates.'],
      answer: [0, 3],
      why: [null, '“Every Stoic” is not a name for one individual: the form is general.', 'The negation changes the form.', null],
      explain: 'Each says that one individual stands in a two-term relation to another.',
    },
    {
      id: 'fm-abstract', type: 'choice', prompt: 'A student notices that a family tree, a chain of command and the “descended from” relation among Greek philosophical schools all branch in the same way, and draws one diagram for all three. What has the student done?',
      options: ['Abstracted a common form.', 'Interpreted a form.', 'Confused form with content.', 'Found a common constituent.'],
      answer: 0,
      explain: 'The diagram keeps the form and drops the content. Reading the diagram as, say, the family tree again would be interpretation.',
    },
    { id: 'fm-north', type: 'translate', prompt: 'Langer: “Montreal is North of Albany and New York” means two statements. Symbolize it.', dictionary: { N: 'x is north of y', m: 'Montreal', a: 'Albany', n: 'New York' }, key: 'Nma • Nmn', wrong: ['Nma ∨ Nmn', 'Nma'] },
    {
      id: 'fm-houses', type: 'structure', prompt: 'Langer’s formal context: four houses, A, B, C and D, and the relation “north of” (N). Which statements are true in it?',
      structure: HOUSES,
      statements: ['Nab', 'Nca', '(x)~Nxx', '(x)(y)(z)[(Nxy • Nyz) ⊃ Nxz]', '(x)(y)(Nxy ⊃ Nyx)', '(∃x)(y)[~(x = y) ⊃ Nxy]'],
      explain: 'A is north of all the others, no house is north of itself, and “north of” is transitive but not symmetric.',
    },
    {
      id: 'fm-between', type: 'structure', prompt: 'A triadic relation. Here B is “x is between y and z”, for three cities on one line. Which statements are true?',
      structure: CITIES,
      statements: ['Bcpb', 'Bcbp', 'Bpcb', '(x)(y)(z)(Bxyz ⊃ Bxzy)', '(∃x)(y)(z)Bxyz'],
      explain: 'Cologne is between Paris and Berlin, in either order; nothing else is between anything. And no city is between every pair, since no city is between itself and another.',
    },
  ],
  margin: {
    title: 'Logic as the study of forms',
    body: [
      'Langer learned logic from Henry Sheffer and Alfred North Whitehead at Harvard and Radcliffe. The preface of her *Introduction to Symbolic Logic* credits Sheffer with “its whole treatment of logic as a science of forms”. Whitehead’s *Treatise on Universal Algebra* (1898) had already compared the different algebras, Boole’s among them, as systems of symbolic reasoning. Floyd’s encyclopedia entry places the book in that setting.',
      'Russell’s passage on form, which Langer quotes, comes from lectures of 1914 in which he called logic “the essence of philosophy”. Wittgenstein’s *Tractatus* (1922) took the idea further: a proposition is a picture of a fact because the two share a logical form, a form that cannot itself be pictured. Langer’s “logical picture” is her version of that thought.',
      'Behind both lies Cassirer’s argument, in *Substance and Function* (1910), that modern science and logic replaced the old concept of substance with the concept of function and relation: things are known by the orders they enter into. Langer later translated Cassirer and built her philosophy of art and mind, in *Philosophy in a New Key* (1942), on the claim that symbols of every kind work by sharing form with what they mean.',
    ],
    sources: ['langer1937', 'copiIL', 'langerSEP', 'russell1914', 'whitehead1898', 'wittgenstein1922', 'cassirer1910', 'langer1942'],
  },
};
