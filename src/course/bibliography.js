// Every source cited in a margin. kind: book | article | chapter | entry | ancient.
// Ancient works are cited by standard book and section numbers, which are
// the same in every edition and translation.

export const BIB = {
  // --- textbooks ---
  copiIL: {
    kind: 'book', author: 'Copi, Irving M., Carl Cohen and Victor Rodych', year: 2019,
    title: 'Introduction to Logic', detail: '15th ed.', publisher: 'London and New York: Routledge',
    note: 'The course’s rules follow chapters 8–10: the nineteen rules of inference (§§9.2, 9.6), conditional and indirect proof (§§9.11–9.12) and the quantification rules (§10.5).',
    url: 'https://www.routledge.com/Introduction-to-Logic/Copi-Cohen-Rodych/p/book/9781138500860',
  },
  copiSL: {
    kind: 'book', author: 'Copi, Irving M.', year: 1979,
    title: 'Symbolic Logic', detail: '5th ed.', publisher: 'New York: Macmillan',
    note: 'Copi’s fuller treatment: relations and identity (ch. 5), deductive systems (ch. 6), class algebra (ch. 7), an axiomatic propositional calculus (ch. 8) and alternative notations, including dots as brackets (ch. 9).',
    url: 'https://archive.org/details/symboliclogic00copi_0',
  },
  langer1937: {
    kind: 'book', author: 'Langer, Susanne K.', year: 1937,
    title: 'An Introduction to Symbolic Logic', publisher: 'London: George Allen & Unwin; Boston: Houghton Mifflin',
    note: 'Logic as the study of form, built around the Boole–Schröder algebra and Principia Mathematica. Revised editions: New York: Dover, 1953 and 1967, with the same pagination and an added appendix on truth tables.',
    url: 'https://archive.org/details/introductiontosy0000lang',
  },
  pelletier2000: {
    kind: 'chapter', author: 'Pelletier, Francis Jeffry', year: 2000,
    title: 'A History of Natural Deduction and Elementary Logic Textbooks',
    container: 'Logical Consequence: Rival Approaches', detail: 'vol. 1, ed. John Woods and Bryson Brown, pp. 105–138', publisher: 'Oxford: Hermes Science',
    note: 'A revised version of “A Brief History of Natural Deduction”, History and Philosophy of Logic 20 (1999): 1–31. On Copi’s quantifier rules and their corrections, pp. 126–128.',
    url: 'https://www.sfu.ca/~jeffpell/papers/pelletierNDtexts.pdf',
  },
  langer1942: {
    kind: 'book', author: 'Langer, Susanne K.', year: 1942,
    title: 'Philosophy in a New Key: A Study in the Symbolism of Reason, Rite, and Art', publisher: 'Cambridge, MA: Harvard University Press',
    note: 'Ch. IV, “Discursive Forms and Presentational Forms”.',
  },
  langerSEP: {
    kind: 'entry', author: 'Floyd, Juliet', year: 2026, title: 'Susanne Langer',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/langer/',
  },
  hurley2018: {
    kind: 'book', author: 'Hurley, Patrick J., and Lori Watson', year: 2018,
    title: 'A Concise Introduction to Logic', detail: '13th ed.', publisher: 'Boston: Cengage',
    note: 'Hurley’s system is Copi’s without Absorption, with indirect proof closed by a discharge line; the course cites its sections second.',
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
  aristotlePostAn: {
    kind: 'ancient', author: 'Aristotle', year: null, title: 'Posterior Analytics',
    detail: 'I.3, 72b5–25 (the regress of demonstration; not all knowledge is demonstrable)',
  },
  aristotlePrA: {
    kind: 'ancient', author: 'Aristotle', year: null, title: 'Prior Analytics',
    detail: 'I.1, 24b18–20 (the definition of a deduction, syllogismos); I.23, 41a23–30 (proof through the impossible); II.4, 57b3–14 (Aristotle’s thesis)',
  },
  dl7: {
    kind: 'ancient', author: 'Diogenes Laertius', year: null, title: 'Lives of Eminent Philosophers',
    detail: 'Book VII (Zeno and the Stoics), §§41–83 on Stoic dialectic, §69 on negation, §180 on Chrysippus’s 705 books', note: 'Trans. R. D. Hicks, Loeb Classical Library, 1925.',
    url: 'https://en.wikisource.org/wiki/Lives_of_the_Eminent_Philosophers/Book_VII', urlLabel: 'Hicks translation',
  },
  sextusM: {
    kind: 'ancient', author: 'Sextus Empiricus', year: null, title: 'Against the Logicians',
    detail: '(Adversus Mathematicos VII–VIII); VIII.11–12 on signifier, signified and object; VIII.89–90 on negation; VIII.112–117 on the conditional',
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
    url: 'http://www.perseus.tufts.edu/hopper/text?doc=Gel.+16.8', urlLabel: 'Perseus',
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
  algebraLogicSEP: {
    kind: 'entry', author: 'Burris, Stanley, and Javier Legris', year: 2009, title: 'The Algebra of Logic Tradition',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/algebra-logic-tradition/',
  },
  mereologySEP: {
    kind: 'entry', author: 'Varzi, Achille', year: 2003, title: 'Mereology',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/mereology/',
  },
  lesniewskiSEP: {
    kind: 'entry', author: 'Simons, Peter', year: 2007, title: 'Stanisław Leśniewski',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/lesniewski/',
  },
  euler1768: {
    kind: 'book', author: 'Euler, Leonhard', year: 1768, title: 'Lettres à une princesse d’Allemagne sur divers sujets de physique et de philosophie',
    detail: 'vol. 2', publisher: 'Saint Petersburg: Imperial Academy of Sciences',
    note: 'The letters on the syllogism draw concepts as circles. The linked scan is of an early printing held by the ETH-Bibliothek Zürich.', url: 'https://zenodo.org/records/7421191', urlLabel: 'Zenodo',
  },
  venn1880: {
    kind: 'article', author: 'Venn, John', year: 1880, title: 'On the Diagrammatic and Mechanical Representation of Propositions and Reasonings',
    container: 'The London, Edinburgh, and Dublin Philosophical Magazine and Journal of Science', detail: '5th ser., 10 (59): 1–18',
    url: 'https://doi.org/10.1080/14786448008626877', urlLabel: 'DOI',
  },
  huntington1904: {
    kind: 'article', author: 'Huntington, Edward V.', year: 1904, title: 'Sets of Independent Postulates for the Algebra of Logic',
    container: 'Transactions of the American Mathematical Society', detail: '5 (3): 288–309',
    url: 'https://doi.org/10.1090/S0002-9947-1904-1500675-4', urlLabel: 'DOI',
  },
  sheffer1913: {
    kind: 'article', author: 'Sheffer, Henry M.', year: 1913, title: 'A Set of Five Independent Postulates for Boolean Algebras, with Application to Logical Constants',
    container: 'Transactions of the American Mathematical Society', detail: '14 (4): 481–488',
    url: 'https://doi.org/10.1090/S0002-9947-1913-1500960-1', urlLabel: 'DOI',
  },
  hilbert1899: {
    kind: 'book', author: 'Hilbert, David', year: 1899, title: 'Grundlagen der Geometrie', publisher: 'Leipzig: Teubner',
    note: 'Translated as The Foundations of Geometry (Chicago: Open Court, 1902).',
  },
  fregeHilbertSEP: {
    kind: 'entry', author: 'Blanchette, Patricia', year: 2007, title: 'The Frege–Hilbert Controversy',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/frege-hilbert/',
  },
  bourbaki1950: {
    kind: 'article', author: 'Bourbaki, Nicolas', year: 1950, title: 'The Architecture of Mathematics',
    container: 'The American Mathematical Monthly', detail: '57 (4): 221–232',
    url: 'https://doi.org/10.1080/00029890.1950.11999523', urlLabel: 'DOI',
  },
  lautman1938: {
    kind: 'book', author: 'Lautman, Albert', year: 1938, title: 'Essai sur les notions de structure et d’existence en mathématiques', publisher: 'Paris: Hermann',
    note: 'Translated in Mathematics, Ideas and the Physical Real, trans. Simon B. Duffy (London: Continuum, 2011).',
  },
  structuralismSEP: {
    kind: 'entry', author: 'Reck, Erich, and Georg Schiemer', year: 2019, title: 'Structuralism in the Philosophy of Mathematics',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/structuralism-mathematics/',
  },
  whiteheadRussell1910: {
    kind: 'book', author: 'Whitehead, Alfred North, and Bertrand Russell', year: 1910, title: 'Principia Mathematica',
    detail: 'vol. I', publisher: 'Cambridge: Cambridge University Press',
    note: 'The primitive propositions *1.1–*1.72 open Part I, section A; the dot notation is explained in the Introduction, ch. I.',
  },
  bernays1926: {
    kind: 'article', author: 'Bernays, Paul', year: 1926, title: 'Axiomatische Untersuchung des Aussagen-Kalküls der „Principia Mathematica“',
    container: 'Mathematische Zeitschrift', detail: '25: 305–320',
    note: 'Translated in J.-Y. Béziau (ed.), Universal Logic: An Anthology (Basel: Birkhäuser, 2012), pp. 43–56.',
    url: 'https://doi.org/10.1007/BF01283841', urlLabel: 'DOI',
  },
  rosser1953: {
    kind: 'book', author: 'Rosser, J. Barkley', year: 1953, title: 'Logic for Mathematicians', publisher: 'New York: McGraw-Hill',
    note: 'The source of the system R.S. in Copi’s Symbolic Logic.',
  },
  principiaSEP: {
    kind: 'entry', author: 'Linsky, Bernard, and Andrew David Irvine', year: 1996, title: 'Principia Mathematica',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/principia-mathematica/',
  },
  godelSEP: {
    kind: 'entry', author: 'Raatikainen, Panu', year: 2013, title: 'Gödel’s Incompleteness Theorems',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/goedel-incompleteness/',
  },
  russell1914: {
    kind: 'book', author: 'Russell, Bertrand', year: 1914, title: 'Our Knowledge of the External World as a Field for Scientific Method in Philosophy',
    publisher: 'Chicago and London: Open Court', note: 'Lecture II, “Logic as the Essence of Philosophy”, contains the passage on form that Langer quotes.',
  },
  whitehead1898: {
    kind: 'book', author: 'Whitehead, Alfred North', year: 1898, title: 'A Treatise on Universal Algebra, with Applications', detail: 'vol. I',
    publisher: 'Cambridge: Cambridge University Press',
  },
  cassirer1910: {
    kind: 'book', author: 'Cassirer, Ernst', year: 1910, title: 'Substanzbegriff und Funktionsbegriff', publisher: 'Berlin: Bruno Cassirer',
    note: 'Translated by W. C. and M. C. Swabey as Substance and Function (Chicago: Open Court, 1923).',
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
    container: 'American Journal of Mathematics', detail: '7 (2–3): 180–202',
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
    container: 'Proceedings of the London Mathematical Society', detail: '2nd series, 42: 230–265', note: 'Read November 1936; the volume is dated 1937.',
  },

  // --- relations ---
  demorganHead: {
    kind: 'book', author: 'De Morgan, Augustus', year: 1847, title: 'Formal Logic', detail: 'p. 114 (“the head of a man is the head of an animal”)',
    publisher: 'London: Taylor and Walton', url: 'https://archive.org/details/formallogicorthe00demouoft', urlLabel: 'Internet Archive',
  },
  peirce1870: {
    kind: 'article', author: 'Peirce, Charles S.', year: 1870, title: 'Description of a Notation for the Logic of Relatives',
    container: 'Memoirs of the American Academy of Arts and Sciences', detail: 'n.s. 9: 317–378', note: 'Read 26 January 1870; the volume was printed in 1873.',
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
    kind: 'article', author: 'Moore, G. E.', year: '1919–20', title: 'External and Internal Relations',
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

  // --- paradox ---
  russell1902: {
    kind: 'chapter', author: 'Russell, Bertrand', year: 1902, title: 'Letter to Frege',
    container: 'From Frege to Gödel', detail: 'ed. J. van Heijenoort, with Frege’s reply', publisher: 'Cambridge, MA: Harvard University Press, 1967',
  },
  grelling1908: {
    kind: 'article', author: 'Grelling, Kurt, and Leonard Nelson', year: 1908, title: 'Bemerkungen zu den Paradoxieen von Russell und Burali-Forti',
    container: 'Abhandlungen der Fries’schen Schule', detail: 'n.s. 2: 301–334',
  },
  curry1942: {
    kind: 'article', author: 'Curry, Haskell B.', year: 1942, title: 'The Inconsistency of Certain Formal Logics',
    container: 'Journal of Symbolic Logic', detail: '7 (3): 115–117',
  },
  quine1966: {
    kind: 'chapter', author: 'Quine, W. V. O.', year: 1966, title: 'The Ways of Paradox',
    container: 'The Ways of Paradox and Other Essays', publisher: 'New York: Random House',
  },
  sainsbury2009: {
    kind: 'book', author: 'Sainsbury, R. M.', year: 2009, title: 'Paradoxes', detail: '3rd ed.',
    publisher: 'Cambridge: Cambridge University Press',
  },
  unger1979: {
    kind: 'article', author: 'Unger, Peter', year: 1979, title: 'There Are No Ordinary Things',
    container: 'Synthese', detail: '41 (2): 117–154',
  },
  williamson1994: {
    kind: 'book', author: 'Williamson, Timothy', year: 1994, title: 'Vagueness', publisher: 'London: Routledge',
  },
  liarSEP: {
    kind: 'entry', author: 'Beall, Jc, Michael Glanzberg and David Ripley', year: null, title: 'Liar Paradox',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/liar-paradox/',
  },
  russellParadoxSEP: {
    kind: 'entry', author: 'Irvine, A. D., and Harry Deutsch', year: null, title: 'Russell’s Paradox',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/russell-paradox/',
  },
  currySEP: {
    kind: 'entry', author: 'Shapiro, Lionel, and Jc Beall', year: null, title: 'Curry’s Paradox',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/curry-paradox/',
  },
  soritesSEP: {
    kind: 'entry', author: 'Hyde, Dominic, and Diana Raffman', year: null, title: 'Sorites Paradox',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/sorites-paradox/',
  },

  // --- many values ---
  lukasiewicz1920: {
    kind: 'article', author: 'Łukasiewicz, Jan', year: 1920, title: 'On Three-Valued Logic (O logice trójwartościowej)',
    container: 'Ruch Filozoficzny', detail: '5: 170–171', note: 'English in Łukasiewicz, Selected Works, ed. L. Borkowski, Amsterdam: North-Holland, 1970.',
  },
  bochvar1938: {
    kind: 'article', author: 'Bochvar, D. A.', year: 1938, title: 'On a Three-Valued Logical Calculus and Its Application to the Analysis of Contradictories',
    container: 'Matematicheskii Sbornik', detail: '4 (46): 287–308',
    note: 'Trans. M. Bergmann in History and Philosophy of Logic 2 (1981): 87–112.',
  },
  kleene1952: {
    kind: 'book', author: 'Kleene, Stephen Cole', year: 1952, title: 'Introduction to Metamathematics',
    detail: '§64 (the three-valued logic of partial recursive predicates)', publisher: 'Amsterdam: North-Holland; New York: Van Nostrand',
  },
  priest1979: {
    kind: 'article', author: 'Priest, Graham', year: 1979, title: 'The Logic of Paradox',
    container: 'Journal of Philosophical Logic', detail: '8 (1): 219–241',
  },
  kripke1975: {
    kind: 'article', author: 'Kripke, Saul', year: 1975, title: 'Outline of a Theory of Truth',
    container: 'Journal of Philosophy', detail: '72 (19): 690–716',
  },
  priest2008: {
    kind: 'book', author: 'Priest, Graham', year: 2008, title: 'An Introduction to Non-Classical Logic: From If to Is',
    detail: '2nd ed.', publisher: 'Cambridge: Cambridge University Press',
  },
  manyValuedSEP: {
    kind: 'entry', author: 'Gottwald, Siegfried', year: null, title: 'Many-Valued Logic',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/logic-manyvalued/',
  },
  dialetheismSEP: {
    kind: 'entry', author: 'Priest, Graham, Francesco Berto and Zach Weber', year: null, title: 'Dialetheism',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/dialetheism/',
  },

  // --- modality ---
  leibnizTheodicy: {
    kind: 'ancient', author: 'Leibniz, G. W.', year: 1710, title: 'Theodicy', url: 'https://www.gutenberg.org/ebooks/17147', urlLabel: 'Project Gutenberg',
    detail: '§§405–417 (Valla’s dialogue continued: Sextus Tarquinius, Theodorus, and the palace of the Fates, whose pyramid of worlds is at §416)',
    note: 'Trans. E. M. Huggard, London: Routledge & Kegan Paul, 1951.',
  },
  kripke1963: {
    kind: 'article', author: 'Kripke, Saul', year: 1963, title: 'Semantical Considerations on Modal Logic',
    container: 'Acta Philosophica Fennica', detail: '16: 83–94',
  },
  epictetus: {
    kind: 'ancient', author: 'Epictetus', year: null, title: 'Discourses',
    detail: 'II.19.1–5 (the Master Argument)', note: 'In Discourses, Fragments, Handbook, trans. R. Hard, Oxford World’s Classics, 2014.',
    url: 'https://en.wikisource.org/wiki/Epictetus,_the_Discourses_as_reported_by_Arrian,_the_Manual,_and_Fragments/Book_2/Chapter_19', urlLabel: 'Oldfather translation',
  },
  prior1955: {
    kind: 'article', author: 'Prior, A. N.', year: 1955, title: 'Diodoran Modalities',
    container: 'Philosophical Quarterly', detail: '5 (20): 205–213',
  },
  prior1967: {
    kind: 'book', author: 'Prior, A. N.', year: 1967, title: 'Past, Present and Future', publisher: 'Oxford: Clarendon Press',
  },
  modalSEP: {
    kind: 'entry', author: 'Garson, James', year: null, title: 'Modal Logic',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/logic-modal/',
  },
  dialecticalSEP: {
    kind: 'entry', author: 'Bobzien, Susanne', year: null, title: 'Dialectical School',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/dialectical-school/',
  },
  futureSEP: {
    kind: 'entry', author: 'Øhrstrøm, Peter, and Per Hasle', year: null, title: 'Future Contingents',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/future-contingents/',
  },

  // --- implication ---
  andersonBelnap1975: {
    kind: 'book', author: 'Anderson, Alan Ross, and Nuel D. Belnap', year: 1975, title: 'Entailment: The Logic of Relevance and Necessity',
    detail: 'vol. 1', publisher: 'Princeton: Princeton University Press',
  },
  mccall1966: {
    kind: 'article', author: 'McCall, Storrs', year: 1966, title: 'Connexive Implication',
    container: 'Journal of Symbolic Logic', detail: '31 (3): 415–433',
  },
  relevanceSEP: {
    kind: 'entry', author: 'Mares, Edwin', year: null, title: 'Relevance Logic',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/logic-relevance/',
  },
  connexiveSEP: {
    kind: 'entry', author: 'Wansing, Heinrich', year: null, title: 'Connexive Logic',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/logic-connexive/',
  },

  // --- intuitionism ---
  brouwer1908: {
    kind: 'article', author: 'Brouwer, L. E. J.', year: 1908, title: 'The Unreliability of the Logical Principles (De onbetrouwbaarheid der logische principes)',
    container: 'Tijdschrift voor Wijsbegeerte', detail: '2: 152–158', note: 'English in Brouwer, Collected Works, vol. 1, ed. A. Heyting, Amsterdam: North-Holland, 1975.',
  },
  heyting1930: {
    kind: 'article', author: 'Heyting, Arend', year: 1930, title: 'Die formalen Regeln der intuitionistischen Logik',
    container: 'Sitzungsberichte der Preussischen Akademie der Wissenschaften, Physikalisch-mathematische Klasse', detail: '42–56',
  },
  kripke1965: {
    kind: 'chapter', author: 'Kripke, Saul', year: 1965, title: 'Semantical Analysis of Intuitionistic Logic I',
    container: 'Formal Systems and Recursive Functions', detail: 'ed. J. N. Crossley and M. A. E. Dummett, 92–130', publisher: 'Amsterdam: North-Holland',
  },
  dummett1977: {
    kind: 'book', author: 'Dummett, Michael', year: 1977, title: 'Elements of Intuitionism', detail: '2nd ed. 2000',
    publisher: 'Oxford: Clarendon Press',
  },
  dummett1973: {
    kind: 'chapter', author: 'Dummett, Michael', year: 1973, title: 'The Philosophical Basis of Intuitionistic Logic',
    container: 'Truth and Other Enigmas', publisher: 'London: Duckworth, 1978',
  },
  intuitionisticSEP: {
    kind: 'entry', author: 'Moschovakis, Joan', year: null, title: 'Intuitionistic Logic',
    container: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/logic-intuitionistic/',
  },

  // --- capstone ---
  hartshorne1962: {
    kind: 'book', author: 'Hartshorne, Charles', year: 1962, title: 'The Logic of Perfection', publisher: 'La Salle, IL: Open Court',
  },
  plantinga1974: {
    kind: 'book', author: 'Plantinga, Alvin', year: 1974, title: 'The Nature of Necessity', publisher: 'Oxford: Clarendon Press',
  },
  klein1999: {
    kind: 'article', author: 'Klein, Peter', year: 1999, title: 'Human Knowledge and the Infinite Regress of Reasons',
    container: 'Philosophical Perspectives', detail: '13: 297–325',
  },
  bonjour1985: {
    kind: 'book', author: 'BonJour, Laurence', year: 1985, title: 'The Structure of Empirical Knowledge',
    publisher: 'Cambridge, MA: Harvard University Press',
  },
};
