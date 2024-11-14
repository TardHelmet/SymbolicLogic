const logicalOperatorsPuzzles = [
    {
        id: "op1",
        question: "∧ means 'AND' - it shows that both parts are true. Click ∧ to acknowledge this.",
        symbols: "∧",
        answer: "∧",
        explanation: "P ∧ Q means 'P AND Q are both true'. For example, if P is 'It's sunny' and Q is 'It's warm', then P ∧ Q means 'It's sunny AND warm'.",
        hint: "Click the AND (∧) symbol."
    },
    {
        id: "op2",
        question: "∨ means 'OR' - it shows that at least one part is true. Click ∨ to acknowledge this.",
        symbols: "∨",
        answer: "∨",
        explanation: "P ∨ Q means 'P OR Q (or both) are true'. If P is 'It's raining' and Q is 'It's snowing', then P ∨ Q means 'It's either raining OR snowing (or both)'.",
        hint: "Click the OR (∨) symbol."
    },
    {
        id: "op3",
        question: "If we have P ∧ Q, what can we conclude about P? Build the answer.",
        symbols: "P ∧ Q ⊢ ?",
        answer: "P",
        explanation: "If we know P AND Q is true (P ∧ Q), then P must be true! AND means both parts are true.",
        hint: "If both P AND Q are true, is P true?"
    },
    {
        id: "op4",
        question: "If we know P is true, what can we say about P ∨ Q? Build the answer.",
        symbols: "P ⊢ ?",
        answer: "P ∨ Q",
        explanation: "If P is true, then P OR Q must be true! It doesn't matter what Q is - if one part of an OR is true, the whole thing is true.",
        hint: "If P is true, then 'P or Q' must be true, regardless of Q."
    }
];
