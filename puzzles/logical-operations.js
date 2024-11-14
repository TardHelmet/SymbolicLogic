const logicalOperationsPuzzles = [
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
    }
];
