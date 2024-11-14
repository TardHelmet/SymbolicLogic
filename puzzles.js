const puzzles = [
    {
        id: 1,
        question: "If P → Q and P is true, what can we conclude about Q?",
        symbols: "P → Q, P ⊢ ?",
        answer: "Q",
        explanation: "This is an example of Modus Ponens. If we know that P implies Q (P → Q) and we know P is true, then Q must also be true.",
        hint: "Think about what the arrow (→) means in terms of logical implication."
    },
    {
        id: 2,
        question: "If P → Q and Q is false, what can we conclude about P?",
        symbols: "P → Q, ¬Q ⊢ ?",
        answer: "¬P",
        explanation: "This is Modus Tollens. If P implies Q, and Q is false, then P must also be false. If P were true, Q would have to be true (by P → Q).",
        hint: "Consider what must be true about P if Q is false, given that P implies Q."
    },
    {
        id: 3,
        question: "If P ∨ Q and ¬P are true, what can we conclude?",
        symbols: "P ∨ Q, ¬P ⊢ ?",
        answer: "Q",
        explanation: "This is Disjunctive Syllogism. If either P or Q is true (P ∨ Q), and we know P is false (¬P), then Q must be true.",
        hint: "If one part of an OR statement is false, what must be true about the other part?"
    },
    {
        id: 4,
        question: "If P ∧ Q is true, what can we conclude about P?",
        symbols: "P ∧ Q ⊢ ?",
        answer: "P",
        explanation: "This is Simplification. If a conjunction (AND statement) is true, both of its parts must be true individually.",
        hint: "What does the ∧ (AND) symbol tell us about both P and Q?"
    },
    {
        id: 5,
        question: "If P is true, what can we conclude about P ∨ Q?",
        symbols: "P ⊢ ?",
        answer: "P ∨ Q",
        explanation: "This is Addition. If P is true, then P OR anything else must also be true, regardless of whether that other thing is true or false.",
        hint: "Remember that OR (∨) only requires one of its parts to be true."
    }
];
