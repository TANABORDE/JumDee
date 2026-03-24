/* ==========================================================================
   Jigsaw Game (js/jigsaw.js)
   Simple 3x3 image tile sliding puzzle for elderly.
   ========================================================================== */

   window.JigsawGame = (function() {
    
    let container = null;
    let finishCallback = null;
    
    // Game State
    let state = {
        gridSize: 3, // 3x3
        tiles: [], // 0 is empty slot
        score: 0,
        moves: 0,
        timer: 0,
        interval: null,
        isPlaying: false,
        // We use CSS gradients or emojis instead of real images for simplicity without loading external assets
        // For a real app, you'd use a canvas or background-image slices
        theme: [1, 2, 3, 4, 5, 6, 7, 8]
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
        startTimer();
    }

    function resetState() {
        if(state.interval) clearInterval(state.interval);
        state = {
            gridSize: 3,
            tiles: initTiles(),
            score: 0,
            moves: 0,
            timer: 0,
            interval: null,
            isPlaying: true,
            theme: state.theme
        };
        ui.scoreDisplay.textContent = '0';
        ui.timerDisplay.textContent = '0:00';
    }

    function initTiles() {
        // Solved state: [1, 2, 3, 4, 5, 6, 7, 8, 0]
        let arr = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        
        // Shuffle by making valid moves to ensure solvability
        // Usually 50-100 random moves is enough
        let blankIdx = 8;
        for (let i = 0; i < 100; i++) {
            const validMoves = getValidMoves(blankIdx, 3);
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            // Swap
            [arr[blankIdx], arr[move]] = [arr[move], arr[blankIdx]];
            blankIdx = move;
        }
        
        return arr;
    }

    function getValidMoves(idx, size) {
        const moves = [];
        const r = Math.floor(idx / size);
        const c = idx % size;

        if (r > 0) moves.push(idx - size); // up
        if (r < size - 1) moves.push(idx + size); // down
        if (c > 0) moves.push(idx - 1); // left
        if (c < size - 1) moves.push(idx + 1); // right

        return moves;
    }

    function renderGameUI() {
        container.innerHTML = '';
        
        const style = document.createElement('style');
        style.textContent = `
            .jigsaw-arena {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
                width: 100%;
                max-width: 350px;
            }
            .jigsaw-board {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 5px;
                width: 100%;
                aspect-ratio: 1/1;
                background-color: var(--blue-200);
                padding: 10px;
                border-radius: var(--border-radius-sm);
            }
            .jigsaw-tile {
                background-color: var(--blue-500);
                color: white;
                font-size: 2.5rem;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                cursor: pointer;
                user-select: none;
                transition: transform 0.1s;
                position: relative;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .jigsaw-tile:active {
                transform: scale(0.95);
            }
            .jigsaw-tile.empty {
                background-color: transparent;
                box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
                cursor: default;
            }
            .jigsaw-tile.correct {
                background-color: var(--success);
            }
            .moves-counter {
                color: var(--text-muted);
                font-size: 1.1rem;
            }
        `;
        container.appendChild(style);

        const arena = document.createElement('div');
        arena.className = 'jigsaw-arena';
        
        const movesDisp = document.createElement('div');
        movesDisp.className = 'moves-counter';
        movesDisp.id = 'jigMoves';
        movesDisp.textContent = 'จำนวนการขยับ: 0';

        const board = document.createElement('div');
        board.className = 'jigsaw-board';
        board.id = 'jigBoard';
        
        arena.appendChild(movesDisp);
        arena.appendChild(board);
        container.appendChild(arena);

        renderBoard();
    }

    function renderBoard() {
        const board = document.getElementById('jigBoard');
        if (!board) return;
        board.innerHTML = '';

        state.tiles.forEach((val, idx) => {
            const tile = document.createElement('div');
            tile.className = 'jigsaw-tile';
            
            if (val === 0) {
                tile.classList.add('empty');
            } else {
                // Determine if in correct spot
                if (val === idx + 1) {
                    tile.classList.add('correct');
                }
                tile.textContent = state.theme[val - 1]; // Use emoji mapping
                
                // Click to slide
                tile.addEventListener('click', () => handleSlide(idx));
            }

            board.appendChild(tile);
        });

        document.getElementById('jigMoves').textContent = `จำนวนการขยับ: ${state.moves}`;
    }

    function handleSlide(idx) {
        if (!state.isPlaying) return;

        const blankIdx = state.tiles.indexOf(0);
        const validMoves = getValidMoves(blankIdx, state.gridSize);

        if (validMoves.includes(idx)) {
            // Swap
            [state.tiles[blankIdx], state.tiles[idx]] = [state.tiles[idx], state.tiles[blankIdx]];
            state.moves++;
            
            renderBoard();
            checkWin();
        }
    }

    function checkWin() {
        let isWin = true;
        for (let i = 0; i < state.tiles.length - 1; i++) {
            if (state.tiles[i] !== i + 1) {
                isWin = false;
                break;
            }
        }
        // Last one must be 0
        if (state.tiles[8] !== 0) isWin = false;

        if (isWin) {
            state.isPlaying = false;
            clearInterval(state.interval);
            
            // Score based on moves
            const idealMoves = 30;
            const deduction = Math.max(0, state.moves - idealMoves);
            state.score = Math.max(20, 100 - deduction);
            
            ui.scoreDisplay.textContent = state.score;

            setTimeout(() => {
                if (finishCallback) {
                    finishCallback(state.score);
                }
            }, 1000);
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
