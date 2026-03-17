/* ==========================================================================
   Math Speed Game (js/math-speed.js)
   Simple arithmetic with multiple choice, designed for elderly.
   ========================================================================== */

   window.MathSpeedGame = (function() {
    
    let container = null;
    let finishCallback = null;
    
    // Game State
    let state = {
        level: 1, // Determines difficulty
        score: 0,
        timeLeft: 60, // 60 seconds game
        interval: null,
        isPlaying: false,
        currentProblem: null
    };

    const ui = {
        scoreDisplay: document.getElementById('gameScore'),
        timerDisplay: document.getElementById('gameTimer')
    };

    function init(targetContainer, onFinish) {
        container = targetContainer;
        finishCallback = onFinish;
        resetState();
        renderGameUI();
        generateProblem();
        startTimer();
    }

    function resetState() {
        if(state.interval) clearInterval(state.interval);
        state = {
            level: 1,
            score: 0,
            timeLeft: 60,
            interval: null,
            isPlaying: true,
            currentProblem: null
        };
        ui.scoreDisplay.textContent = '0';
        ui.timerDisplay.textContent = '1:00';
    }

    function generateProblem() {
        if (!state.isPlaying) return;

        // Keep it simple: addition and subtraction only for elderly
        // mostly single or double digits based on level
        const ops = ['+', '-'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let num1, num2;

        if (state.level < 5) {
            num1 = Math.floor(Math.random() * 10) + 1; // 1-10
            num2 = Math.floor(Math.random() * 10) + 1;
        } else {
            num1 = Math.floor(Math.random() * 20) + 10; // 10-30
            num2 = Math.floor(Math.random() * 20) + 1;
        }

        // Avoid negative results for simplicity
        if (op === '-' && num1 < num2) {
            [num1, num2] = [num2, num1];
        }

        const answer = op === '+' ? num1 + num2 : num1 - num2;
        const problemStr = `${num1} ${op} ${num2}`;

        // Generate choices
        let choices = [answer];
        while (choices.length < 4) {
            let fakeAnswer = answer + (Math.floor(Math.random() * 10) - 5);
            if (fakeAnswer !== answer && fakeAnswer >= 0 && !choices.includes(fakeAnswer)) {
                choices.push(fakeAnswer);
            }
        }
        
        // Shuffle choices
        choices.sort(() => Math.random() - 0.5);

        state.currentProblem = { string: problemStr, answer: answer, choices: choices };
        renderProblem();
    }

    function renderGameUI() {
        container.innerHTML = '';
        
        const style = document.createElement('style');
        style.textContent = `
            .math-arena {
                width: 100%;
                max-width: 400px;
                text-align: center;
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }
            .problem-box {
                font-size: 4rem;
                font-weight: 700;
                color: var(--blue-700);
                background-color: var(--blue-50);
                padding: 2rem;
                border-radius: var(--border-radius);
                box-shadow: inset var(--shadow-sm);
            }
            .choices-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
            .choice-btn {
                font-size: 2rem;
                padding: 1.5rem;
                border-radius: var(--border-radius-sm);
                transition: transform 0.1s, background-color 0.2s;
            }
            .choice-btn:active {
                transform: scale(0.95);
            }
            .choice-btn.correct {
                background-color: var(--success);
                color: white;
                border: none;
            }
            .choice-btn.wrong {
                background-color: var(--error);
                color: white;
                border: none;
            }
        `;
        container.appendChild(style);

        const arena = document.createElement('div');
        arena.className = 'math-arena';
        arena.innerHTML = `
            <div id="problemDisplay" class="problem-box">?</div>
            <div id="choicesDisplay" class="choices-grid"></div>
        `;
        container.appendChild(arena);
    }

    function renderProblem() {
        document.getElementById('problemDisplay').textContent = state.currentProblem.string + ' = ?';
        
        const choicesDiv = document.getElementById('choicesDisplay');
        choicesDiv.innerHTML = '';

        state.currentProblem.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline choice-btn';
            btn.textContent = choice;
            btn.onclick = () => handleChoice(choice, btn);
            choicesDiv.appendChild(btn);
        });
    }

    function handleChoice(choice, btnElement) {
        if (!state.isPlaying) return;

        const isCorrect = choice === state.currentProblem.answer;

        // Disable all buttons to prevent double clicking
        const allBtns = document.getElementById('choicesDisplay').querySelectorAll('button');
        allBtns.forEach(b => b.disabled = true);

        if (isCorrect) {
            btnElement.classList.add('correct');
            state.score += 10;
            ui.scoreDisplay.textContent = state.score;
            state.level++; // Slowly increase difficulty
            
            // Subtle sound or animation can be added here
            setTimeout(() => {
                generateProblem();
            }, 500);
        } else {
            btnElement.classList.add('wrong');
            // Show correct answer visually too
            allBtns.forEach(b => {
                if (parseInt(b.textContent) === state.currentProblem.answer) {
                    b.classList.add('correct');
                }
            });

            setTimeout(() => {
                generateProblem(); // Move to next even if wrong, or we could end game. For elderly, moving on is better.
            }, 1000);
        }
    }

    function startTimer() {
        state.interval = setInterval(() => {
            state.timeLeft--;
            
            const mins = Math.floor(state.timeLeft / 60);
            const secs = state.timeLeft % 60;
            ui.timerDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            
            if (state.timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        state.isPlaying = false;
        clearInterval(state.interval);
        
        // Final score calculation
        setTimeout(() => {
            if (finishCallback) {
                finishCallback(state.score);
            }
        }, 800);
    }

    function cleanup() {
        if(state.interval) clearInterval(state.interval);
        container.innerHTML = '';
    }

    return {
        init,
        cleanup
    };

})();
