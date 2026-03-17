/* ==========================================================================
   Grid Memory Game (js/grid-memory.js)
   Remember the pattern of highlighted squares.
   ========================================================================== */

   window.GridMemoryGame = (function() {
    
    let container = null;
    let finishCallback = null;
    
    // Game State
    let state = {
        gridSize: 3, // 3x3 starts
        level: 1, // Determines how many squares highlight
        sequence: [], // squares to remember
        userSequence: [],
        score: 0,
        gameInterval: null,
        isPlaying: false,
        stage: 'waiting', // waiting, showing, playing
        maxLevels: 10
    };

    const ui = {
        scoreDisplay: document.getElementById('gameScore'),
        timerDisplay: document.getElementById('gameTimer')
    };

    function init(targetContainer, onFinish) {
        container = targetContainer;
        finishCallback = onFinish;
        
        // Hide timer as it's level based not time based mostly, 
        // but we can put level in the timer spot for UI simplicity
        ui.timerDisplay.textContent = `ด่าน: ${state.level}`;
        document.getElementById('gameTimerContainer').innerHTML = `ด่าน: <span id="gameTimer">${state.level}</span>`;
        
        resetState();
        renderGameUI();
        setTimeout(startRound, 1000);
    }

    function resetState() {
        state = {
            gridSize: 3,
            level: 1,
            sequence: [],
            userSequence: [],
            score: 0,
            isPlaying: true,
            stage: 'waiting',
            maxLevels: 7 // End game after 7 rounds to not tire them out
        };
        ui.scoreDisplay.textContent = '0';
        ui.timerDisplay = document.getElementById('gameTimer');
        if(ui.timerDisplay) ui.timerDisplay.textContent = state.level;
    }

    function renderGameUI() {
        container.innerHTML = '';
        
        const style = document.createElement('style');
        style.textContent = `
            .grid-arena {
                width: 100%;
                max-width: 400px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2rem;
            }
            .grid-board {
                display: grid;
                gap: 10px;
                width: 100%;
                aspect-ratio: 1/1;
            }
            .grid-cell {
                background-color: var(--blue-100);
                border-radius: var(--border-radius-sm);
                cursor: pointer;
                transition: background-color 0.2s, transform 0.1s;
                position: relative;
                overflow: hidden;
            }
            .grid-cell:active {
                transform: scale(0.95);
            }
            .grid-cell.highlight {
                background-color: var(--blue-500);
            }
            .grid-cell.success {
                background-color: var(--success);
            }
            .grid-cell.error {
                background-color: var(--error);
            }
            .instruction-text {
                font-size: 1.2rem;
                color: var(--text-main);
                font-weight: 500;
                height: 2rem;
            }
        `;
        container.appendChild(style);

        const arena = document.createElement('div');
        arena.className = 'grid-arena';

        const instr = document.createElement('div');
        instr.id = 'gridInstruction';
        instr.className = 'instruction-text';
        instr.textContent = 'เตรียมตัว...';

        const board = document.createElement('div');
        board.id = 'gridBoard';
        board.className = 'grid-board';
        board.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;

        arena.appendChild(instr);
        arena.appendChild(board);
        container.appendChild(arena);

        createCells(board);
    }

    function createCells(board) {
        board.innerHTML = '';
        const totalCells = Math.pow(state.gridSize, 2);
        
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => handleCellClick(i));
            board.appendChild(cell);
        }
    }

    function startRound() {
        if (!state.isPlaying) return;

        state.stage = 'waiting';
        state.userSequence = [];
        state.sequence = [];

        // Determine number of highlighted cells based on level
        const numCellsToHighlight = Math.min(Math.pow(state.gridSize, 2) - 1, state.level + 2);

        // Generate random sequence without replacement
        const totalCells = Math.pow(state.gridSize, 2);
        const pool = Array.from({length: totalCells}, (_, i) => i);
        
        for (let i = 0; i < numCellsToHighlight; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            state.sequence.push(pool[randomIndex]);
            pool.splice(randomIndex, 1);
        }

        ui.timerDisplay.textContent = state.level;
        document.getElementById('gridInstruction').textContent = 'จดจำช่องที่สว่าง';

        setTimeout(showSequence, 800);
    }

    function showSequence() {
        state.stage = 'showing';
        const cells = document.querySelectorAll('.grid-cell');
        
        // Highlight all sequence cells at once
        state.sequence.forEach(index => {
            cells[index].classList.add('highlight');
        });

        // Hide them after a set time
        const viewTime = Math.max(1000, 3000 - (state.level * 200)); // Gets slightly faster with level
        
        setTimeout(() => {
            cells.forEach(c => c.classList.remove('highlight'));
            state.stage = 'playing';
            document.getElementById('gridInstruction').textContent = 'แตะช่องที่คุณจำได้';
        }, viewTime);
    }

    function handleCellClick(index) {
        if (state.stage !== 'playing') return;

        const cell = document.querySelector(`.grid-cell[data-index="${index}"]`);
        
        // Don't allow clicking same correct cell twice
        if (cell.classList.contains('success')) return;

        if (state.sequence.includes(index)) {
            // Correct click
            cell.classList.add('success');
            state.userSequence.push(index);
            state.score += 10;
            ui.scoreDisplay.textContent = state.score;

            if (state.userSequence.length === state.sequence.length) {
                // Round Complete
                state.stage = 'waiting';
                document.getElementById('gridInstruction').textContent = 'เก่งมาก!';
                
                // Increase grid size if level high enough
                if (state.level === 3) state.gridSize = 4;
                
                setTimeout(() => {
                    state.level++;
                    if (state.level > state.maxLevels) {
                        document.getElementById('gridInstruction').textContent = 'สำเร็จทุกด่านแล้ว!';
                        setTimeout(endGame, 1000);
                    } else {
                        // Re-render board if size changed
                        const board = document.getElementById('gridBoard');
                        board.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;
                        createCells(board);
                        startRound();
                    }
                }, 1500);
            }
        } else {
            // Error
            cell.classList.add('error');
            state.stage = 'waiting';
            document.getElementById('gridInstruction').textContent = 'พลาดซะแล้ว';
            
            // Show correct ones
            const cells = document.querySelectorAll('.grid-cell');
            state.sequence.forEach(idx => {
                if(!cells[idx].classList.contains('success')) {
                    cells[idx].classList.add('highlight'); // show missed ones
                }
            });

            // End game on mistake for elderly, or just move to next? 
            // We'll end the game here since it's memory assessment.
            setTimeout(endGame, 2000);
        }

    }

    function endGame() {
        state.isPlaying = false;
        // Restore timer UI correctly when leaving
        document.getElementById('gameTimerContainer').innerHTML = `เวลา: <span id="gameTimer">0:00</span>`;
        
        if (finishCallback) {
            finishCallback(state.score);
        }
    }

    function cleanup() {
        state.isPlaying = false;
        document.getElementById('gameTimerContainer').innerHTML = `เวลา: <span id="gameTimer">0:00</span>`;
        if(container) container.innerHTML = '';
    }

    return {
        init,
        cleanup
    };

})();
