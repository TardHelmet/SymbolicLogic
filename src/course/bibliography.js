// Every source cited in a margin. kind: book | article | chapter | entry | ancient.
// Ancient works are cited by standard book and section numbers, which are
// the same in every edition and translation.

export const BIB = {
  // --- textbooks ---
  hurley2018: {
    kind: 'book', author: 'Hurley, Patrick J., and Lori Watson', year: 2018,
    title: 'A Concise Introduction to Logic', detail: '13th ed.', publisher: 'Boston: Cengage',
    note: 'The notation, rule names and order of topics in this course follow chapters 1, 6, 7 and 8.',
  },
  forallx: {
    kind: 'book', author: 'Magnus, P. D., Tim Button, Robert Trueman and Richard Zach', year: null,
    title: 'forall x: Calgary. An Introduction to Formal Logic', publisher: 'Open Logic Project',
    note: 'Open access and regularly revised; modern notation and a Fitch-style proof system.',
    url: 'https://forallx.openlogicproject.org/',
  },
  kneale1962: {
    kind: 'book', author: 'Kneale, William, and Martha Kneale', year: 1962,
    title: 'The Development of Logic', publisher: 'Oxford: Clarendon Press',
    note: 'Chapter III covers the Megarians and the Stoics.',
  },

  // --- ancient ---
  aristotlePrA: {
    kind: 'ancient', author: 'Aristotle', year: null, title: 'Prior Analytics',
    detail: 'I.1, 24b18–20 (the definition of a deduction, syllogismos)',
  },
  dl7: {
    kind: 'ancient', author: 'Diogenes Laertius', year: null, title: 'Lives of Eminent Philosophers',
    detail: 'Book VII (Zeno and the Stoics), §§41–83 on Stoic dialectic', note: 'Trans. R. D. Hicks, Loeb Classical Library, 1925.',
    url: 'https://en.wikisource.org/wiki/Lives_of_the_Eminent_Philosophers/Book_VII', urlLabel: 'Hicks translation',
  },
  sextusM: {
    kind: 'ancient', author: 'Sextus Empiricus', year: null, title: 'Against the Logicians',
    detail: '(Adversus Mathematicos VII–VIII); VIII.11–12 on signifier, signified and object; VIII.112–117 on the conditional',
    note: 'Trans. Richard Bett, Cambridge University Press, 2005.',
  },
  sextusM1: {
    kind: 'ancient', author: 'Sextus Empiricus', year: null, title: 'Against the Grammarians',
    detail: '(Adversus Mathematicos I), I.309–310 (Callimachus on the crows)', note: 'Trans. D. L. Blank, Oxford: Clarendon Press, 1998.',
  },
  sextusPH: {
    kind: 'ancient', author: 'Sextus Empiricus', year: null, title: 'Outlines of Scepticism',
    detail: '(Pyrrhoniae Hypotyposes); I.69 (Chrysippus’ dog), II.104–117 (conditionals), II.156–159 (the indemonstrables)',
    note: 'Trans. Julia Annas and Jonathan Barnes, 2nd ed., Cambridge University Press, 2000.',
  },
  gellius: {
    kind: 'ancient', author: 'Aulus Gellius', year: null, title: 'Attic Nights',
    detail: '16.8 (a digest of Stoic logic, including disjunction)', note: 'Trans. J. C. Rolfe, Loeb Classical Library, 1927.',
    url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Gellius/16*.html', urlLabel: 'Rolfe translation',
  },

  // --- Stoic logic, secondary ---
  mates1953: {
    kind: 'book', author: 'Mates, Benson', year: 1953, title: 'Stoic Logic',
    publisher: 'Berkeley: University of California Press',
    note: 'The study that established Stoic logic as a logic of propositions.',
  },
  longsedley1987: {
    kind: 'book', author: 'Long, A. A., and D. N. Sedley', year: 1987, title: 'The Hellenistic Philosophers',
    detail: 'vol. 1: Translations of the Principal Sources', publisher: 'Cambridge: Cambridge University Press',
    note: 'The sections on Stoic logic and semantics collect the ancient testimony in translation.',
  },
  bobzien2003: {
    kind: 'chapter', author: 'Bobzien, Susanne', year: 2003, title: 'Logic',
    container: 'The Cambridge Companion to the Stoics', detail: 'ed. Brad Inwood', publisher: 'Cambridge: Cambridge University Press',
  },
  bobzienSEP: {
    kind: 'entry', author: 'Bobzien, Susanne', year: null, title: 'Ancient Logic',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/logic-ancient/',
  },
  lukasiewicz1934: {
    kind: 'article', author: 'Łukasiewicz, Jan', year: 1934, title: 'On the History of the Logic of Propositions',
    note: 'Originally in Polish (Przegląd Filozoficzny 37); English in Łukasiewicz, Selected Works, ed. L. Borkowski, Amsterdam: North-Holland, 1970.',
  },

  // --- disjunction ---
  jennings1994: {
    kind: 'book', author: 'Jennings, R. E.', year: 1994, title: 'The Genealogy of Disjunction',
    publisher: 'New York: Oxford University Press',
    note: 'Argues that English “or” is not simply ambiguous between an inclusive and an exclusive sense.',
  },

  // --- the conditional ---
  lewis1912: {
    kind: 'article', author: 'Lewis, C. I.', year: 1912, title: 'Implication and the Algebra of Logic',
    container: 'Mind', detail: '21 (84): 522–531',
  },
  grice1989: {
    kind: 'chapter', author: 'Grice, H. P.', year: 1989, title: 'Indicative Conditionals',
    container: 'Studies in the Way of Words', publisher: 'Cambridge, MA: Harvard University Press',
    note: 'From the William James Lectures of 1967; defends the material reading of “if” with conversational implicature.',
  },
  edgingtonSEP: {
    kind: 'entry', author: 'Edgington, Dorothy', year: null, title: 'Indicative Conditionals',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/conditionals/',
  },
  edgington1995: {
    kind: 'article', author: 'Edgington, Dorothy', year: 1995, title: 'On Conditionals',
    container: 'Mind', detail: '104 (414): 235–329',
  },
};
