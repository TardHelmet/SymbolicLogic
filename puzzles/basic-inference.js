const basicInferencePuzzles = [
    {
        id: 1,
        question: "If P → Q and P is true, what can we conclude about Q?",
        symbols: "P → Q, P ⊢ ?",
        answer: "Q",
        explanation: "This is Modus Ponens. If we know that P implies Q (P → Q) and we know P is true, then Q must also be true.",
        hint: "Think about what the arrow (→) means in terms of logical implication."
    },
    {
        id: 2,
        question: "If P → Q and Q is false, what can we conclude about P?",
        symbols: "P → Q, ¬Q ⊢ ?",
        answer: "¬P",
        explanation: "This is Modus Tollens. If P implies Q, and Q is false, then P must also be false. If P were true, Q would have to be true (by P → Q).",
        hint: "Consider what must be true about P if Q is false, given that P implies Q."
    }
];
