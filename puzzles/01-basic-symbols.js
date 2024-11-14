const basicSymbolsPuzzles = [
    {
        id: "sym1",
        question: "This is P, a basic proposition. It represents a statement that can be true or false. Click P to acknowledge this.",
        symbols: "P",
        answer: "P",
        explanation: "P is used to represent a simple statement or proposition. For example, P might represent 'It is raining' or 'The sky is blue'.",
        hint: "Just click the P symbol to continue."
    },
    {
        id: "sym2",
        question: "Q is another proposition, different from P. Click Q to acknowledge this.",
        symbols: "Q",
        answer: "Q",
        explanation: "Q is like P - it represents a different statement. If P is 'It is raining', Q might be 'The ground is wet'.",
        hint: "Click the Q symbol to continue."
    },
    {
        id: "sym3",
        question: "The arrow → means 'implies' or 'if...then'. Click the arrow to acknowledge this.",
        symbols: "→",
        answer: "→",
        explanation: "→ shows that one thing leads to another. For example, 'If it rains, then the ground gets wet' would be written as 'P → Q'.",
        hint: "Click the arrow (→) symbol."
    },
    {
        id: "sym4",
        question: "¬ means 'not' - it negates what comes after it. Click ¬ to acknowledge this.",
        symbols: "¬",
        answer: "¬",
        explanation: "¬ turns a statement into its opposite. If P is 'It is raining', then ¬P means 'It is not raining'.",
        hint: "Click the not (¬) symbol."
    },
    {
        id: "sym5",
        question: "⊢ means 'therefore' - it shows what we can conclude. Click ⊢ to acknowledge this.",
        symbols: "⊢",
        answer: "⊢",
        explanation: "⊢ is used to show what logically follows. For example, 'P → Q, P ⊢ Q' means 'If P implies Q, and P is true, therefore Q must be true'.",
        hint: "Click the therefore (⊢) symbol."
    }
];

console.log('Basic symbols puzzles loaded:', basicSymbolsPuzzles.length);
