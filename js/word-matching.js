/* ==========================================================================
   Word Matching Game (js/word-matching.js)
   Match simple words with their meanings or categories.
   ========================================================================== */

   window.WordMatchingGame = (function() {
    
    let container = null;
    let finishCallback = null;
    
    // Game Data (tailored for Thai elderly: simple categories)
    const wordPairs = [
        { term: 'สุนัข', match: 'สัตว์เลี้ยง' },
        { term: 'แมว', match: 'สัตว์เลี้ยง' },
        { term: 'มะม่วง', match: 'ผลไม้' },
        { term: 'กล้วย', match: 'ผลไม้' },
        { term: 'ข้าว', match: 'อาหาร' },
        { term: 'ต้มยำ', match: 'อาหาร' },
        { term: 'เสื้อ', match: 'เครื่องแต่งกาย' },
        { term: 'กางเกง', match: 'เครื่องแต่งกาย' },
        { term: 'ดอกมะลิ', match: 'ดอกไม้' },
        { term: 'ดอกกุหลาบ', match: 'ดอกไม้' }
    ];

    let state = {
        leftItems: [],
        rightItems: [],
        selectedLeft: null,
        selectedRight: null,
        matchedCount: 0,
        score: 0,
        timeLeft: 60,
        interval: null,
        isPlaying: false,
        pairsToMatch: 4 // How many pairs per round
    };

    const ui = {
        scoreDisplay: document.getElementById('gameScore'),
        timerDisplay: document.getElementById('gameTimer')
    };

    function init(targetContainer, onFinish) {
        container = targetContainer;
        finishCallback = onFinish;
        generateRound();
        renderGameUI();
        startTimer();
    }

    function generateRound() {
        if(state.interval) clearInterval(state.interval);

        // Pick random pairs from the pool
        let shuffledPool = [...wordPairs].sort(() => 0.5 - Math.random());
        let selectedPairs = shuffledPool.slice(0, state.pairsToMatch);

        // Create left and right columns
        state.leftItems = selectedPairs.map((p, i) => ({ id: `L${i}`, text: p.term, matchId: `R${i}`, isMatched: false }));
        state.rightItems = selectedPairs.map((p, i) => ({ id: `R${i}`, text: p.match, matchId: `L${i}`, isMatched: false }));

        // Shuffle within columns so they don't align straight across
        state.leftItems.sort(() => 0.5 - Math.random());
        state.rightItems.sort(() => 0.5 - Math.random());

        state.selectedLeft = null;
        state.selectedRight = null;
        state.matchedCount = 0;
        state.score = 0;
        state.timeLeft = 60;
        state.isPlaying = true;

        ui.scoreDisplay.textContent = state.score;
        ui.timerDisplay.textContent = '1:00';
    }

    function renderGameUI() {
        container.innerHTML = '';
        
        const style = document.createElement('style');
        style.textContent = `
            .word-arena {
                width: 100%;
                max-width: 500px;
                display: flex;
                gap: 2rem;
                justify-content: space-between;
                padding: 1rem;
            }
            .word-column {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                flex: 1;
            }
            .word-btn {
                background-color: var(--primary-white);
                border: 2px solid var(--blue-200);
                padding: 1rem;
                border-radius: var(--border-radius-sm);
                font-size: 1.25rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
                color: var(--text-main);
                box-shadow: var(--shadow-sm);
            }
            .word-btn:active {
                transform: scale(0.98);
            }
            .word-btn.selected {
                background-color: var(--blue-100);
                border-color: var(--blue-500);
            }
            .word-btn.matched {
                background-color: var(--success-light);
                border-color: var(--success);
                color: var(--success);
                opacity: 0.7;
                pointer-events: none;
            }
            .word-btn.error {
                background-color: var(--error-light);
                border-color: var(--error);
                color: var(--error);
                animation: shake 0.4s;
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            .instruction-text {
                text-align: center;
                color: var(--text-muted);
                margin-bottom: 1rem;
                font-size: 1.1rem;
            }
        `;
        container.appendChild(style);

        const heading = document.createElement('div');
        heading.className = 'instruction-text';
        heading.textContent = 'จับคู่คำที่มีความหมายเกี่ยวข้องกัน';
        container.appendChild(heading);

        const arena = document.createElement('div');
        arena.className = 'word-arena';

        const colLeft = document.createElement('div');
        colLeft.className = 'word-column';
        colLeft.id = 'colLeft';

        const colRight = document.createElement('div');
        colRight.className = 'word-column';
        colRight.id = 'colRight';

        arena.appendChild(colLeft);
        arena.appendChild(colRight);
        container.appendChild(arena);

        renderList(state.leftItems, colLeft, 'left');
        renderList(state.rightItems, colRight, 'right');
    }

    function renderList(items, element, side) {
        element.innerHTML = '';
        items.forEach(item => {
            const btn = document.createElement('div');
            btn.className = 'word-btn';
            btn.id = item.id;
            btn.textContent = item.text;
            
            if (item.isMatched) btn.classList.add('matched');

            btn.addEventListener('click', () => handleSelection(item, btn, side));
            element.appendChild(btn);
        });
    }

    function handleSelection(item, btnElement, side) {
        if (!state.isPlaying || item.isMatched) return;

        // Clear previous selection on the same side
        const col = side === 'left' ? document.getElementById('colLeft') : document.getElementById('colRight');
        col.querySelectorAll('.word-btn').forEach(b => b.classList.remove('selected', 'error'));

        btnElement.classList.add('selected');

        if (side === 'left') {
            state.selectedLeft = item;
        } else {
            state.selectedRight = item;
        }

        checkMatch();
    }

    function checkMatch() {
        if (state.selectedLeft && state.selectedRight) {
            
            const btnL = document.getElementById(state.selectedLeft.id);
            const btnR = document.getElementById(state.selectedRight.id);

            if (state.selectedLeft.matchId === state.selectedRight.id) {
                // Correct match
                state.selectedLeft.isMatched = true;
                state.selectedRight.isMatched = true;
                
                btnL.className = 'word-btn matched';
                btnR.className = 'word-btn matched';

                state.matchedCount++;
                state.score += 25;
                ui.scoreDisplay.textContent = state.score;

                state.selectedLeft = null;
                state.selectedRight = null;

                if (state.matchedCount === state.pairsToMatch) {
                    endGame();
                }

            } else {
                // Wrong match
                btnL.classList.remove('selected');
                btnR.classList.remove('selected');
                
                btnL.classList.add('error');
                btnR.classList.add('error');

                state.selectedLeft = null;
                state.selectedRight = null;

                setTimeout(() => {
                    if(btnL && !btnL.classList.contains('matched')) btnL.classList.remove('error');
                    if(btnR && !btnR.classList.contains('matched')) btnR.classList.remove('error');
                }, 500);
            }
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
