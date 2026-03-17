/* ==========================================================================
   Sudoku Game (js/sudoku.js)
   4x4 (Shidoku) for simplicity and large touch targets for the elderly.
   ========================================================================== */

   window.SudokuGame = (function() {
    
    let container = null;
    let finishCallback = null;
    
    let state = {
        score: 0,
        board: [],     // 4x4 array of current numbers (0 if empty)
        solution: [],  // 4x4 array of correct numbers
        initial: [],   // 4x4 array of given numbers
        selectedCell: null, // {r, c}
        timer: 0,
        interval: null,
        isPlaying: false
    };

    const ui = {
        scoreDisplay: document.getElementById('gameScore'),
        timerDisplay: document.getElementById('gameTimer')
    };

    // A few pre-generated 4x4 puzzles (Shidoku)
    const puzzles = [
        {
            solution: [
                [3, 4, 1, 2],
                [2, 1, 4, 3],
                [4, 3, 2, 1],
                [1, 2, 3, 4]
            ],
            missing: 5 // number of cells to remove
        },
        {
            solution: [
                [1, 2, 3, 4],
                [4, 3, 2, 1],
                [2, 1, 4, 3],
                [3, 4, 1, 2]
            ],
            missing: 6
        },
        {
            solution: [
                [4, 1, 2, 3],
                [3, 2, 4, 1],
                [1, 4, 3, 2],
                [2, 3, 1, 4]
            ],
            missing: 7
        }
    ];

    function init(targetContainer, onFinish) {
        container = targetContainer;
        finishCallback = onFinish;
        resetState();
        generatePuzzle();
        renderGameUI();
        startTimer();
    }

    function resetState() {
        if(state.interval) clearInterval(state.interval);
        state = {
            score: 0,
            board: [],
            solution: [],
            initial: [],
            selectedCell: null,
            timer: 0,
            interval: null,
            isPlaying: true
        };
        ui.scoreDisplay.textContent = '0';
        ui.timerDisplay.textContent = '0:00';
    }

    function generatePuzzle() {
        // Pick a random puzzle
        const puz = puzzles[Math.floor(Math.random() * puzzles.length)];
        
        // Deep copy solution
        state.solution = puz.solution.map(row => [...row]);
        state.board = puz.solution.map(row => [...row]);
        state.initial = [
            [true, true, true, true],
            [true, true, true, true],
            [true, true, true, true],
            [true, true, true, true]
        ];

        // Remove numbers to create puzzle
        let removed = 0;
        while (removed < puz.missing) {
            let r = Math.floor(Math.random() * 4);
            let c = Math.floor(Math.random() * 4);
            if (state.board[r][c] !== 0) {
                state.board[r][c] = 0;
                state.initial[r][c] = false;
                removed++;
            }
        }
    }

    function renderGameUI() {
        container.innerHTML = '';
        
        const style = document.createElement('style');
        style.textContent = `
            .sudoku-arena {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1.5rem;
                width: 100%;
                max-width: 400px;
            }
            .sudoku-board {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                width: 100%;
                aspect-ratio: 1/1;
                background-color: var(--blue-700);
                gap: 2px;
                border: 4px solid var(--blue-700);
                border-radius: var(--border-radius-sm);
                padding: 2px;
            }
            .sudoku-cell {
                background-color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.5rem;
                font-weight: 600;
                color: var(--text-main);
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .sudoku-cell.given {
                background-color: var(--blue-50);
                color: var(--blue-700);
            }
            .sudoku-cell.selected {
                background-color: var(--blue-200) !important;
            }
            .sudoku-cell.error {
                color: var(--error);
            }
            /* Thicker borders for 2x2 blocks */
            .sudoku-cell[data-col="1"], .sudoku-cell[data-col="3"] { margin-right: 2px; }
            .sudoku-cell[data-row="1"], .sudoku-cell[data-row="3"] { margin-bottom: 2px; }

            .numpad {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
                width: 100%;
            }
            .num-btn {
                background-color: var(--primary-white);
                border: 2px solid var(--blue-200);
                border-radius: var(--border-radius-sm);
                padding: 1rem;
                font-size: 1.5rem;
                font-weight: 600;
                color: var(--blue-600);
                cursor: pointer;
                box-shadow: var(--shadow-sm);
            }
            .num-btn:active {
                transform: scale(0.95);
                background-color: var(--blue-50);
            }
        `;
        container.appendChild(style);

        const arena = document.createElement('div');
        arena.className = 'sudoku-arena';

        // Board
        const board = document.createElement('div');
        board.className = 'sudoku-board';
        board.id = 'sudokuBoard';
        
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                if (state.initial[r][c]) cell.classList.add('given');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.textContent = state.board[r][c] === 0 ? '' : state.board[r][c];
                
                cell.addEventListener('click', () => selectCell(r, c));
                board.appendChild(cell);
            }
        }

        // Numpad
        const numpad = document.createElement('div');
        numpad.className = 'numpad';
        for (let i = 1; i <= 4; i++) {
            const btn = document.createElement('button');
            btn.className = 'num-btn';
            btn.textContent = i;
            btn.addEventListener('click', () => handleNumberInput(i));
            numpad.appendChild(btn);
        }

        arena.appendChild(board);
        arena.appendChild(numpad);
        container.appendChild(arena);
    }

    function selectCell(r, c) {
        if (!state.isPlaying || state.initial[r][c]) return;

        state.selectedCell = {r, c};
        
        // Update UI
        const cells = document.querySelectorAll('.sudoku-cell');
        cells.forEach(cell => cell.classList.remove('selected'));
        
        const selectedEl = document.querySelector(`.sudoku-cell[data-row="${r}"][data-col="${c}"]`);
        if (selectedEl) selectedEl.classList.add('selected');
    }

    function handleNumberInput(num) {
        if (!state.isPlaying || !state.selectedCell) return;

        const {r, c} = state.selectedCell;
        state.board[r][c] = num;

        const cellEl = document.querySelector(`.sudoku-cell[data-row="${r}"][data-col="${c}"]`);
        cellEl.textContent = num;

        // Check against solution
        if (num === state.solution[r][c]) {
            cellEl.classList.remove('error');
            state.score += 5;
            ui.scoreDisplay.textContent = state.score;
            checkWin();
        } else {
            cellEl.classList.add('error');
        }
    }

    function checkWin() {
        let isComplete = true;
        let isCorrect = true;

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (state.board[r][c] === 0) isComplete = false;
                if (state.board[r][c] !== state.solution[r][c]) isCorrect = false;
            }
        }

        if (isComplete && isCorrect) {
            state.score += 50; // Win bonus
            ui.scoreDisplay.textContent = state.score;
            endGame();
        }
    }

    function startTimer() {
        state.interval = setInterval(() => {
            state.timer++;
            const mins = Math.floor(state.timer / 60);
            const secs = state.timer % 60;
            ui.timerDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function endGame() {
        state.isPlaying = false;
        clearInterval(state.interval);
        
        setTimeout(() => {
            if (finishCallback) {
                finishCallback(state.score);
            }
        }, 800);
    }

    function cleanup() {
        state.isPlaying = false;
        if(state.interval) clearInterval(state.interval);
        if(container) container.innerHTML = '';
    }

    return {
        init,
        cleanup
    };

})();
