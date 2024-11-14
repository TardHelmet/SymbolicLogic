let currentPuzzleIndex = 0;
let allPuzzles = [];
let currentAnswer = '';

function log(message) {
    console.log('[Logic Game]:', message);
}

function initializePuzzles() {
    allPuzzles = [
        ...basicSymbolsPuzzles,
        ...simpleImplicationsPuzzles,
        ...logicalOperatorsPuzzles
    ];
}

function displayPuzzle() {
    const puzzle = allPuzzles[currentPuzzleIndex];
    log('Displaying puzzle: ' + puzzle.id);
    
    document.getElementById('puzzle').innerHTML = `
        <div class="puzzle-text">
            <p>${puzzle.question}</p>
            <p class="symbols">${puzzle.symbols}</p>
        </div>
        <div class="progress">Puzzle ${currentPuzzleIndex + 1} of ${allPuzzles.length}</div>
    `;
    
    document.getElementById('answer-display').textContent = '';
    document.getElementById('feedback').innerHTML = '';
    currentAnswer = '';
}

function updateAnswerDisplay() {
    document.getElementById('answer-display').textContent = currentAnswer;
}

function addSymbol(symbol) {
    log('Symbol clicked: ' + symbol);
    currentAnswer += symbol;
    updateAnswerDisplay();
}

function backspace() {
    currentAnswer = currentAnswer.slice(0, -1);
    updateAnswerDisplay();
}

function clearAnswer() {
    currentAnswer = '';
    updateAnswerDisplay();
}

function checkAnswer() {
    const feedback = document.getElementById('feedback');
    const puzzle = allPuzzles[currentPuzzleIndex];
    const correct = currentAnswer.trim() === puzzle.answer;
    log('Answer submitted: ' + currentAnswer + ' (Correct: ' + correct + ')');

    if (correct) {
        feedback.innerHTML = `
            <div class="feedback-content correct">
                <div class="feedback-text">
                    <p>Correct! ✓</p>
                    <p>${puzzle.explanation}</p>
                </div>
                ${currentPuzzleIndex < allPuzzles.length - 1 ? `
                    <div class="feedback-action">
                        <button class="next-btn" onclick="nextPuzzle()">Next Puzzle</button>
                    </div>
                ` : `
                    <div class="feedback-action">
                        <p class="completion-message">Congratulations!</p>
                    </div>
                `}
            </div>
        `;
    } else {
        feedback.innerHTML = `
            <div class="feedback-content incorrect">
                <p>Not quite right. Try again!</p>
                <p>Hint: ${puzzle.hint}</p>
            </div>
        `;
    }
}

function nextPuzzle() {
    if (currentPuzzleIndex < allPuzzles.length - 1) {
        currentPuzzleIndex++;
        displayPuzzle();
        log('Moving to next puzzle: ' + currentPuzzleIndex);
    }
}

function bindEvents() {
    log('Setting up event handlers');

    document.querySelectorAll('.symbol-btn').forEach(btn => {
        btn.addEventListener('click', () => addSymbol(btn.textContent));
    });

    document.getElementById('backspace').addEventListener('click', backspace);
    document.getElementById('clear').addEventListener('click', clearAnswer);
    document.getElementById('submit-btn').addEventListener('click', checkAnswer);

    log('Event handlers set up complete');
}

document.addEventListener('DOMContentLoaded', () => {
    log('DOM loaded, starting game...');
    initializePuzzles();
    bindEvents();
    displayPuzzle();
});

window.game = { nextPuzzle };
