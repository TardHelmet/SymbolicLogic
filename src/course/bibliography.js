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

  // --- laws of thought, truth tables ---
  aristotleMet: {
    kind: 'ancient', author: 'Aristotle', year: null, title: 'Metaphysics',
    detail: 'Γ 3–4, 1005b19–1009a5 (non-contradiction); Γ 7, 1011b23–24 (excluded middle); Ι 4, 1055a3–b29 (contrariety)',
  },
  leibnizMonadology: {
    kind: 'ancient', author: 'Leibniz, G. W.', year: 1714, title: 'Monadology',
    detail: '§§31–33 (the principles of contradiction and sufficient reason)',
    note: 'In Philosophical Essays, trans. R. Ariew and D. Garber, Indianapolis: Hackett, 1989.',
  },
  messina2009: {
    kind: 'article', author: 'Messina, James, and Donald Rutherford', year: 2009, title: 'Leibniz on Compossibility',
    container: 'Philosophy Compass', detail: '4 (6): 962–977',
    note: 'Surveys the logical reading of compossibility as consistency and its rivals.',
  },
  wittgenstein1922: {
    kind: 'book', author: 'Wittgenstein, Ludwig', year: 1922, title: 'Tractatus Logico-Philosophicus',
    detail: '4.31, 4.46–4.4661 (truth tables; tautology and contradiction “say nothing”)',
    publisher: 'London: Kegan Paul', url: 'https://www.gutenberg.org/ebooks/5740', urlLabel: 'Project Gutenberg',
  },
  post1921: {
    kind: 'article', author: 'Post, Emil L.', year: 1921, title: 'Introduction to a General Theory of Elementary Propositions',
    container: 'American Journal of Mathematics', detail: '43 (3): 163–185',
  },
  anellis2012: {
    kind: 'article', author: 'Anellis, Irving H.', year: 2012, title: 'Peirce’s Truth-functional Analysis and the Origin of the Truth Table',
    container: 'History and Philosophy of Logic', detail: '33 (1): 87–97',
  },

  // --- consequence ---
  bolzano1837: {
    kind: 'book', author: 'Bolzano, Bernard', year: 1837, title: 'Wissenschaftslehre',
    detail: '§155 (derivability)', note: 'Trans. as Theory of Science by P. Rusnock and R. George, Oxford University Press, 2014.',
  },
  tarski1936: {
    kind: 'chapter', author: 'Tarski, Alfred', year: 1936, title: 'On the Concept of Logical Consequence',
    container: 'Logic, Semantics, Metamathematics', detail: '2nd ed., ed. J. Corcoran, trans. J. H. Woodger',
    publisher: 'Indianapolis: Hackett, 1983',
  },
  etchemendy1990: {
    kind: 'book', author: 'Etchemendy, John', year: 1990, title: 'The Concept of Logical Consequence',
    publisher: 'Cambridge, MA: Harvard University Press',
  },
  consequenceSEP: {
    kind: 'entry', author: 'Beall, Jc, Greg Restall and Gil Sagi', year: null, title: 'Logical Consequence',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/logical-consequence/',
  },

  // --- natural deduction ---
  carroll1895: {
    kind: 'article', author: 'Carroll, Lewis', year: 1895, title: 'What the Tortoise Said to Achilles',
    container: 'Mind', detail: '4 (14): 278–280', url: 'https://en.wikisource.org/wiki/What_the_Tortoise_Said_to_Achilles',
    urlLabel: 'Wikisource',
  },
  ryle1950: {
    kind: 'chapter', author: 'Ryle, Gilbert', year: 1950, title: '‘If,’ ‘So,’ and ‘Because’',
    container: 'Philosophical Analysis', detail: 'ed. Max Black', publisher: 'Ithaca: Cornell University Press',
  },
  gentzen1935: {
    kind: 'article', author: 'Gentzen, Gerhard', year: 1935, title: 'Untersuchungen über das logische Schließen',
    container: 'Mathematische Zeitschrift', detail: '39: 176–210, 405–431',
    note: 'Trans. as “Investigations into Logical Deduction” in The Collected Papers of Gerhard Gentzen, ed. M. E. Szabo, Amsterdam: North-Holland, 1969.',
  },
  jaskowski1934: {
    kind: 'article', author: 'Jaśkowski, Stanisław', year: 1934, title: 'On the Rules of Suppositions in Formal Logic',
    container: 'Studia Logica', detail: '1: 5–32',
  },
  ndSEP: {
    kind: 'entry', author: 'Pelletier, Francis Jeffry, and Allen P. Hazen', year: null, title: 'Natural Deduction Systems in Logic',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/natural-deduction/',
  },
  demorgan1847: {
    kind: 'book', author: 'De Morgan, Augustus', year: 1847, title: 'Formal Logic: or, The Calculus of Inference, Necessary and Probable',
    publisher: 'London: Taylor and Walton', url: 'https://archive.org/details/formallogicorthe00demouoft', urlLabel: 'Internet Archive',
  },
  boole1854: {
    kind: 'book', author: 'Boole, George', year: 1854, title: 'An Investigation of the Laws of Thought',
    detail: 'ch. III (the law x² = x and the principle of contradiction)',
    publisher: 'London: Walton and Maberly', url: 'https://www.gutenberg.org/ebooks/15114', urlLabel: 'Project Gutenberg',
  },
  herbrand1930: {
    kind: 'book', author: 'Herbrand, Jacques', year: 1930, title: 'Recherches sur la théorie de la démonstration',
    note: 'Doctoral thesis, Paris; contains the deduction theorem. Trans. in Herbrand, Logical Writings, ed. W. Goldfarb, Dordrecht: Reidel, 1971.',
  },

  // --- reductio and explosion ---
  lewisLangford1932: {
    kind: 'book', author: 'Lewis, C. I., and C. H. Langford', year: 1932, title: 'Symbolic Logic',
    publisher: 'New York: Century',
  },
  paraconsistentSEP: {
    kind: 'entry', author: 'Priest, Graham, Koji Tanaka and Zach Weber', year: null, title: 'Paraconsistent Logic',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/logic-paraconsistent/',
  },

  // --- predicates and quantifiers ---
  frege1879: {
    kind: 'book', author: 'Frege, Gottlob', year: 1879, title: 'Begriffsschrift, eine der arithmetischen nachgebildete Formelsprache des reinen Denkens',
    publisher: 'Halle: Louis Nebert',
    note: 'Trans. S. Bauer-Mengelberg in J. van Heijenoort (ed.), From Frege to Gödel, Cambridge, MA: Harvard University Press, 1967.',
  },
  frege1891: {
    kind: 'article', author: 'Frege, Gottlob', year: 1891, title: 'Function and Concept',
    note: 'Lecture, Jena. Trans. P. Geach in Translations from the Philosophical Writings of Gottlob Frege, ed. P. Geach and M. Black, Oxford: Blackwell, 1952.',
  },
  frege1892: {
    kind: 'article', author: 'Frege, Gottlob', year: 1892, title: 'On Sense and Reference (Über Sinn und Bedeutung)',
    container: 'Zeitschrift für Philosophie und philosophische Kritik', detail: '100: 25–50',
    note: 'Trans. in Geach and Black (eds.), Translations from the Philosophical Writings of Gottlob Frege.',
  },
  peirce1885: {
    kind: 'article', author: 'Peirce, Charles S.', year: 1885, title: 'On the Algebra of Logic: A Contribution to the Philosophy of Notation',
    container: 'American Journal of Mathematics', detail: '7 (2): 180–202',
  },
  quine1948: {
    kind: 'article', author: 'Quine, W. V. O.', year: 1948, title: 'On What There Is',
    container: 'Review of Metaphysics', detail: '2 (5): 21–38',
  },
  vanheijenoort1967: {
    kind: 'book', author: 'van Heijenoort, Jean (ed.)', year: 1967, title: 'From Frege to Gödel: A Source Book in Mathematical Logic, 1879–1931',
    publisher: 'Cambridge, MA: Harvard University Press',
  },

  // --- the square ---
  aristotleDeInt: {
    kind: 'ancient', author: 'Aristotle', year: null, title: 'De Interpretatione',
    detail: 'chs. 6–7 (contradictories and contraries); ch. 9 (future contingents: the sea battle)',
  },
  squareSEP: {
    kind: 'entry', author: 'Parsons, Terence', year: null, title: 'The Traditional Square of Opposition',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/square/',
  },

  // --- arbitrary objects, negation ---
  berkeley1710: {
    kind: 'book', author: 'Berkeley, George', year: 1710, title: 'A Treatise Concerning the Principles of Human Knowledge',
    detail: 'Introduction, §§15–16 (the demonstration about a triangle)',
    url: 'https://www.gutenberg.org/ebooks/4723', urlLabel: 'Project Gutenberg',
  },
  fine1985: {
    kind: 'book', author: 'Fine, Kit', year: 1985, title: 'Reasoning with Arbitrary Objects',
    publisher: 'Oxford: Blackwell (Aristotelian Society Series 3)',
  },
  horn1989: {
    kind: 'book', author: 'Horn, Laurence R.', year: 1989, title: 'A Natural History of Negation',
    publisher: 'Chicago: University of Chicago Press', note: 'Reissued Stanford: CSLI, 2001.',
  },

  // --- models and decidability ---
  tarski1933: {
    kind: 'chapter', author: 'Tarski, Alfred', year: 1933, title: 'The Concept of Truth in Formalized Languages',
    container: 'Logic, Semantics, Metamathematics', detail: '2nd ed., ed. J. Corcoran, trans. J. H. Woodger',
    publisher: 'Indianapolis: Hackett, 1983', note: 'Polish original 1933; German 1935.',
  },
  lowenheim1915: {
    kind: 'article', author: 'Löwenheim, Leopold', year: 1915, title: 'Über Möglichkeiten im Relativkalkül',
    container: 'Mathematische Annalen', detail: '76: 447–470', note: 'Trans. in van Heijenoort, From Frege to Gödel.',
  },
  behmann1922: {
    kind: 'article', author: 'Behmann, Heinrich', year: 1922, title: 'Beiträge zur Algebra der Logik, insbesondere zum Entscheidungsproblem',
    container: 'Mathematische Annalen', detail: '86: 163–229',
  },
  church1936: {
    kind: 'article', author: 'Church, Alonzo', year: 1936, title: 'A Note on the Entscheidungsproblem',
    container: 'Journal of Symbolic Logic', detail: '1 (1): 40–41',
  },
  turing1936: {
    kind: 'article', author: 'Turing, Alan M.', year: 1936, title: 'On Computable Numbers, with an Application to the Entscheidungsproblem',
    container: 'Proceedings of the London Mathematical Society', detail: '2nd series, 42: 230–265',
  },

  // --- relations ---
  demorganHorse: {
    kind: 'book', author: 'De Morgan, Augustus', year: 1847, title: 'Formal Logic', detail: 'p. 114 (the head of a horse)',
    publisher: 'London: Taylor and Walton', url: 'https://archive.org/details/formallogicorthe00demouoft', urlLabel: 'Internet Archive',
  },
  peirce1870: {
    kind: 'article', author: 'Peirce, Charles S.', year: 1870, title: 'Description of a Notation for the Logic of Relatives',
    container: 'Memoirs of the American Academy of Arts and Sciences', detail: '9: 317–378',
  },
  mugnai1992: {
    kind: 'book', author: 'Mugnai, Massimo', year: 1992, title: 'Leibniz’ Theory of Relations',
    publisher: 'Stuttgart: Franz Steiner (Studia Leibnitiana Supplementa 28)',
  },
  humeTreatise: {
    kind: 'ancient', author: 'Hume, David', year: 1739, title: 'A Treatise of Human Nature',
    detail: '1.1.5 (Of relations), 1.3.1 (Of knowledge)', url: 'https://www.gutenberg.org/ebooks/4705', urlLabel: 'Project Gutenberg',
  },
  bradley1893: {
    kind: 'book', author: 'Bradley, F. H.', year: 1893, title: 'Appearance and Reality',
    detail: 'ch. III (Relation and Quality)', publisher: 'London: Swan Sonnenschein',
  },
  russell1903: {
    kind: 'book', author: 'Russell, Bertrand', year: 1903, title: 'The Principles of Mathematics',
    detail: 'Part IV (Order), especially ch. 26 (Asymmetrical Relations)', publisher: 'Cambridge: Cambridge University Press',
  },
  moore1919: {
    kind: 'article', author: 'Moore, G. E.', year: 1919, title: 'External and Internal Relations',
    container: 'Proceedings of the Aristotelian Society', detail: '20: 40–62',
  },
  james1912: {
    kind: 'book', author: 'James, William', year: 1912, title: 'Essays in Radical Empiricism',
    detail: 'ch. II (A World of Pure Experience) on conjunctive relations', publisher: 'New York: Longmans, Green',
  },
  relationsSEP: {
    kind: 'entry', author: 'MacBride, Fraser', year: null, title: 'Relations',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/relations/',
  },
  bradleySEP: {
    kind: 'entry', author: 'Perovic, Katarina', year: null, title: 'Bradley’s Regress',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/bradley-regress/',
  },

  // --- identity and descriptions ---
  leibnizDiscourse: {
    kind: 'ancient', author: 'Leibniz, G. W.', year: 1686, title: 'Discourse on Metaphysics',
    detail: '§§8–9 (complete concepts; no two substances entirely alike), §13 (Caesar and the Rubicon)',
    note: 'In Philosophical Essays, trans. R. Ariew and D. Garber, Indianapolis: Hackett, 1989.',
  },
  leibnizClarke: {
    kind: 'ancient', author: 'Leibniz, G. W., and Samuel Clarke', year: 1717, title: 'The Leibniz–Clarke Correspondence',
    detail: 'Leibniz’s fourth paper, §§4–6 (no two leaves alike); fifth paper, §47 (relations)',
    note: 'Ed. H. G. Alexander, Manchester: Manchester University Press, 1956.',
  },
  black1952: {
    kind: 'article', author: 'Black, Max', year: 1952, title: 'The Identity of Indiscernibles',
    container: 'Mind', detail: '61 (242): 153–164',
  },
  russell1905: {
    kind: 'article', author: 'Russell, Bertrand', year: 1905, title: 'On Denoting',
    container: 'Mind', detail: '14 (56): 479–493', url: 'https://en.wikisource.org/wiki/On_Denoting', urlLabel: 'Wikisource',
  },
  meinong1904: {
    kind: 'chapter', author: 'Meinong, Alexius', year: 1904, title: 'The Theory of Objects (Über Gegenstandstheorie)',
    container: 'Realism and the Background of Phenomenology', detail: 'ed. R. Chisholm', publisher: 'Glencoe, IL: Free Press, 1960',
  },
  strawson1950: {
    kind: 'article', author: 'Strawson, P. F.', year: 1950, title: 'On Referring',
    container: 'Mind', detail: '59 (235): 320–344',
  },
  descriptionsSEP: {
    kind: 'entry', author: 'Ludlow, Peter', year: null, title: 'Descriptions',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/descriptions/',
  },
  nonexistentSEP: {
    kind: 'entry', author: 'Reicher, Maria', year: null, title: 'Nonexistent Objects',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/nonexistent-objects/',
  },
  freeLogicSEP: {
    kind: 'entry', author: 'Nolt, John', year: null, title: 'Free Logic',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/logic-free/',
  },
  indiscerniblesSEP: {
    kind: 'entry', author: 'Forrest, Peter', year: null, title: 'The Identity of Indiscernibles',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/identity-indiscernible/',
  },
};
