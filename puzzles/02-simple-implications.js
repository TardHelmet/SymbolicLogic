const simpleImplicationsPuzzles = [
    {
        id: "imp1",
        question: "If we have P → Q (P implies Q), and we know P is true, what can we conclude? Build the answer using the symbols.",
        symbols: "P → Q, P ⊢ ?",
        answer: "Q",
        explanation: "When we have P → Q (if P then Q), and we know P is true, we can conclude Q must be true. This is like saying 'If it rains (P), the ground gets wet (Q)', and we see it's raining, so the ground must be wet.",
        hint: "If P leads to Q (P → Q), and P is true, then Q must happen."
    },
    {
        id: "imp2",
        question: "If we have P → Q, and we know Q is false (¬Q), what can we conclude about P? Build the answer.",
        symbols: "P → Q, ¬Q ⊢ ?",
        answer: "¬P",
        explanation: "If P leads to Q, but Q is false, then P must also be false. Think about it: if rain makes the ground wet (P → Q), but the ground is not wet (¬Q), then it must not be raining (¬P).",
        hint: "If P leads to Q, but Q isn't true, could P be true?"
    },
    {
        id: "imp3",
        question: "If we have P → Q, and we know ¬P (not P), what can we conclude about Q?",
        symbols: "P → Q, ¬P ⊢ ?",
        answer: "?",
        explanation: "When P implies Q but P is false, we can't conclude anything about Q! If 'rain leads to wet ground' but it's not raining, the ground could still be wet from something else.",
        hint: "Just click the ? symbol - we can't know for sure about Q in this case."
    }
];
