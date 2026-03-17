/* ==========================================================================
   Memory Matching Game (js/memory-matching.js)
   Card flip mechanics to match pairs of icons.
   ========================================================================== */

   window.MemoryMatchingGame = (function() {
    
    let container = null;
    let finishCallback = null;
    
    // Game State
    let state = {
        cards: [],
        flippedIds: [],
        matchedIds: [],
        moves: 0,
        score: 0,
        timer: 0,
        interval: null,
        isPlaying: false,
        theme: ['apple', 'banana', 'cherry', 'grape', 'orange', 'pear'],
        difficultyPairs: 6 // 12 cards total
    };

    // DOM Elements scoped to this game
    const ui = {
        board: null,
        scoreDisplay: document.getElementById('gameScore'),
        timerDisplay: document.getElementById('gameTimer')
    };

    // Icons Mapping (using Lucide icons as strings or simple emojis for elderly)
    // We will use clear, distinct emojis for maximum visibility and friendliness
    const emojis = {
        'apple': '🍎',
        'banana': '🍌',
        'cherry': '🍒',
        'grape': '🍇',
        'orange': '🍊',
        'pear': '🍐',
        'watermelon': '🍉',
        'strawberry': '🍓'
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
            cards: generateDeck(),
            flippedIds: [],
            matchedIds: [],
            moves: 0,
            score: 0,
            timer: 0,
            interval: null,
            isPlaying: true,
            theme: state.theme,
            difficultyPairs: state.difficultyPairs
        };
        
        ui.scoreDisplay.textContent = '0';
        ui.timerDisplay.textContent = '0:00';
    }

    function generateDeck() {
        // Select required number of pairs from theme
        let selectedIcons = state.theme.slice(0, state.difficultyPairs);
        // Duplicate to make pairs
        let deck = [...selectedIcons, ...selectedIcons];
        // Shuffle (Fisher-Yates)
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        // Map to objects
        return deck.map((icon, index) => ({
            id: index,
            icon: icon,
            isFlipped: false,
            isMatched: false
        }));
    }

    function renderGameUI() {
        container.innerHTML = '';
        
        // Add specific styles for this game
        const style = document.createElement('style');
        style.textContent = `
            .memory-board {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                width: 100%;
                max-width: 400px;
                margin: 0 auto;
                perspective: 1000px;
            }
            .memory-card {
                aspect-ratio: 1/1;
                background-color: var(--blue-100);
                border-radius: var(--border-radius-sm);
                cursor: pointer;
                position: relative;
                transform-style: preserve-3d;
                transition: transform 0.5s;
                box-shadow: var(--shadow-sm);
            }
            .memory-card.flipped {
                transform: rotateY(180deg);
            }
            .memory-card.matched {
                opacity: 0.6;
                transform: rotateY(180deg) scale(0.95);
            }
            .card-face {
                position: absolute;
                width: 100%;
                height: 100%;
                backface-visibility: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--border-radius-sm);
                font-size: 3rem; /* Huge for elderly */
            }
            .card-front {
                background-color: var(--blue-500);
                color: white;
            }
            .card-front::after {
                content: "?";
                font-family: 'Kanit';
            }
            .card-back {
                background-color: white;
                transform: rotateY(180deg);
                border: 2px solid var(--blue-200);
            }
        `;
        container.appendChild(style);

        ui.board = document.createElement('div');
        ui.board.className = 'memory-board';
        
        state.cards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'memory-card';
            cardEl.dataset.id = card.id;
            
            cardEl.innerHTML = `
                <div class="card-face card-front"></div>
                <div class="card-face card-back">${emojis[card.icon]}</div>
            `;
            
            cardEl.addEventListener('click', () => handleCardClick(card.id));
            ui.board.appendChild(cardEl);
        });
        
        container.appendChild(ui.board);
    }

    function handleCardClick(id) {
        if (!state.isPlaying) return;
        if (state.flippedIds.length >= 2) return; // Prevent clicking more than 2
        
        const cardObj = state.cards.find(c => c.id === id);
        if (cardObj.isFlipped || cardObj.isMatched) return;

        // Flip logic
        cardObj.isFlipped = true;
        state.flippedIds.push(id);
        updateCardUI(id);

        if (state.flippedIds.length === 2) {
            state.moves++;
            checkMatch();
        }
    }

    function updateCardUI(id) {
        const cardEl = ui.board.querySelector(`.memory-card[data-id="${id}"]`);
        const cardObj = state.cards.find(c => c.id === id);
        
        if (cardObj.isMatched) {
            cardEl.className = 'memory-card matched';
        } else if (cardObj.isFlipped) {
            cardEl.className = 'memory-card flipped';
        } else {
            cardEl.className = 'memory-card';
        }
    }

    function checkMatch() {
        const [id1, id2] = state.flippedIds;
        const card1 = state.cards.find(c => c.id === id1);
        const card2 = state.cards.find(c => c.id === id2);
        
        if (card1.icon === card2.icon) {
            // Match found!
            card1.isMatched = true;
            card2.isMatched = true;
            state.matchedIds.push(id1, id2);
            state.score += 20;
            ui.scoreDisplay.textContent = state.score;
            
            setTimeout(() => {
                updateCardUI(id1);
                updateCardUI(id2);
                state.flippedIds = [];
                checkGameEnd();
            }, 500);
            
        } else {
            // No match
            setTimeout(() => {
                card1.isFlipped = false;
                card2.isFlipped = false;
                updateCardUI(id1);
                updateCardUI(id2);
                state.flippedIds = [];
            }, 1000); // 1 sec delay giving them time to memorize
        }
    }

    function checkGameEnd() {
        if (state.matchedIds.length === state.cards.length) {
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
        
        // Calculate bonus based on time and moves
        let timeBonus = Math.max(0, 100 - state.timer);
        let movePenalty = state.moves * 2;
        let finalScore = Math.max(10, state.score + timeBonus - movePenalty);
        
        setTimeout(() => {
            if (finishCallback) {
                finishCallback(finalScore);
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
