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
            .header-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                margin-bottom: 0.5rem;
            }
            .info-button {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 2px solid var(--text-muted);
                background-color: transparent;
                color: var(--text-muted);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.2s;
                font-weight: bold;
                padding: 0;
            }
            .info-button:hover {
                background-color: var(--blue-100);
                color: var(--blue-500);
                border-color: var(--blue-500);
            }
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .modal-box {
                background-color: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: var(--text-muted);
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
            }
            .modal-close:hover {
                color: var(--text-primary);
            }
            .modal-title {
                font-size: 1.3rem;
                font-weight: bold;
                color: var(--text-primary);
            }
            .modal-label {
                color: var(--text-muted);
                font-size: 0.9rem;
                margin: 1rem 0 0.5rem 0;
                font-weight: 500;
            }
            .example-board {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 5px;
                width: 100%;
                aspect-ratio: 1/1;
                background-color: var(--blue-200);
                padding: 10px;
                border-radius: var(--border-radius-sm);
            }
            .example-tile {
                background-color: var(--success);
                color: white;
                font-size: 1.5rem;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .example-tile.empty {
                background-color: var(--blue-300);
            }
        `;
        container.appendChild(style);

        const arena = document.createElement('div');
        arena.className = 'jigsaw-arena';
        
        const movesDisp = document.createElement('div');
        movesDisp.className = 'moves-counter';
        movesDisp.id = 'jigMoves';
        movesDisp.textContent = 'จำนวนการขยับ: 0';
        
        arena.appendChild(movesDisp);

        const board = document.createElement('div');
        board.className = 'jigsaw-board';
        board.id = 'jigBoard';
        
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

    function showExampleModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'modal-box';
        
        const header = document.createElement('div');
        header.className = 'modal-header';
        const title = document.createElement('div');
        title.className = 'modal-title';
        title.textContent = 'วิธีเล่น: จิ๊กซอว์';
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.textContent = '✕';
        closeBtn.onclick = () => overlay.remove();
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        const description = document.createElement('p');
        description.style.cssText = `
            margin: 0 0 1.5rem 0;
            color: var(--text-muted);
            font-size: 0.95rem;
            line-height: 1.6;
        `;
        description.textContent = 'แตะอื่นส่วนที่อยู่ติดกับช่องว่างเพื่อเลื่อนสลับ เรียงภาพให้สมบูรณ์';
        
        const label = document.createElement('div');
        label.className = 'modal-label';
        label.textContent = 'ตัวอย่างที่ถูกต้อง:';
        
        const exampleBoard = document.createElement('div');
        exampleBoard.className = 'example-board';
        for (let i = 1; i <= 8; i++) {
            const tile = document.createElement('div');
            tile.className = 'example-tile';
            tile.textContent = i;
            exampleBoard.appendChild(tile);
        }
        const emptyTile = document.createElement('div');
        emptyTile.className = 'example-tile empty';
        exampleBoard.appendChild(emptyTile);
        
        const button = document.createElement('button');
        button.style.cssText = `
            width: 100%;
            padding: 0.75rem 1.5rem;
            background-color: var(--blue-500);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            margin-top: 1.5rem;
            transition: background-color 0.2s;
        `;
        button.textContent = 'เริ่มเล่นกันเลย';
        button.onmouseover = () => button.style.backgroundColor = 'var(--blue-600)';
        button.onmouseout = () => button.style.backgroundColor = 'var(--blue-500)';
        button.onclick = () => overlay.remove();
        
        modal.appendChild(header);
        modal.appendChild(description);
        modal.appendChild(label);
        modal.appendChild(exampleBoard);
        modal.appendChild(button);
        overlay.appendChild(modal);
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };
        document.body.appendChild(overlay);
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
        cleanup,
        showExampleModal
    };

})();
