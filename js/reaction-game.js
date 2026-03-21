/* ==========================================================================
   Reaction Game (js/reaction-game.js)
   Test reflexes by tapping the moving target quickly.
   ========================================================================== */

   window.ReactionGameGame = (function() {
    
    let container = null;
    let finishCallback = null;
    
    let state = {
        score: 0,
        timeLeft: 30, // 30 seconds game
        gameInterval: null,
        targetTimeout: null,
        isPlaying: false,
        arenaRect: null
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
        spawnTarget(); // Initial spawn
    }

    function resetState() {
        if(state.gameInterval) clearInterval(state.gameInterval);
        if(state.targetTimeout) clearTimeout(state.targetTimeout);
        state = {
            score: 0,
            timeLeft: 30,
            gameInterval: null,
            targetTimeout: null,
            isPlaying: true,
            arenaRect: null
        };
        ui.scoreDisplay.textContent = '0';
        ui.timerDisplay.textContent = '0:30';
    }

    function renderGameUI() {
        container.innerHTML = '';
        
        const style = document.createElement('style');
        style.textContent = `
            .reaction-arena {
                width: 100%;
                height: 60vh;
                min-height: 300px;
                position: relative;
                overflow: hidden;
                background-color: var(--blue-50);
                border-radius: var(--border-radius);
                border: 2px dashed var(--blue-200);
            }
            .reaction-target {
                position: absolute;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background-color: var(--error);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                color: white;
                cursor: pointer;
                box-shadow: var(--shadow-md);
                transition: transform 0.1s;
                user-select: none;
                /* Add a subtle pulse animation to attract attention */
                animation: pulse 1.5s infinite;
            }
            .reaction-target:active {
                transform: scale(0.9);
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
            .tap-effect {
                position: absolute;
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background-color: rgba(34, 197, 94, 0.5);
                transform: translate(-50%, -50%) scale(0);
                animation: ripple 0.4s ease-out forwards;
                pointer-events: none;
            }
            @keyframes ripple {
                to { transform: translate(-50%, -50%) scale(2); opacity: 0; }
            }
        `;
        container.appendChild(style);

        const arena = document.createElement('div');
        arena.className = 'reaction-arena';
        arena.id = 'reactionArena';
        container.appendChild(arena);

        // Calculate arena dimensions for bounding
        // Must delay slightly or use ResizeObserver to ensure it is in DOM and styled
        setTimeout(() => {
            state.arenaRect = arena.getBoundingClientRect();
        }, 50);
    }

    function spawnTarget() {
        if (!state.isPlaying) return;
        
        const arena = document.getElementById('reactionArena');
        if (!arena) return;

        // Clear existing target
        const existing = arena.querySelector('.reaction-target');
        if (existing) existing.remove();

        // Recalculate rect just in case of screen resize
        state.arenaRect = arena.getBoundingClientRect();
        
        const targetSize = 80;
        const maxX = state.arenaRect.width - targetSize;
        const maxY = state.arenaRect.height - targetSize;
        
        // Random Position
        const x = Math.max(0, Math.floor(Math.random() * maxX));
        const y = Math.max(0, Math.floor(Math.random() * maxY));

        const target = document.createElement('div');
        target.className = 'reaction-target';
        target.style.left = `${x}px`;
        target.style.top = `${y}px`;
        target.innerHTML = '⚡';

        // Add both click and touchstart for better mobile responsiveness
        const handleTap = (e) => {
            e.preventDefault(); // prevent double firing if both touch & click happen
            handleHit(e, x, y, targetSize);
        };
        
        target.addEventListener('mousedown', handleTap);
        target.addEventListener('touchstart', handleTap, {passive: false});

        arena.appendChild(target);

        // Auto move target after random time if missed (1.5s to 3s)
        const moveTime = Math.floor(Math.random() * 1500) + 1500;
        state.targetTimeout = setTimeout(() => {
            if (state.isPlaying) spawnTarget();
        }, moveTime);
    }

    function handleHit(e, targetX, targetY, targetSize) {
        if (!state.isPlaying) return;

        state.score += 5; // Base score
        ui.scoreDisplay.textContent = state.score;

        // Create visual effect
        const arena = document.getElementById('reactionArena');
        const effect = document.createElement('div');
        effect.className = 'tap-effect';
        
        // Use client coordinates or target center for effect position
        const rect = arena.getBoundingClientRect();
        let clientX, clientY;
        
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX || rect.left + targetX + targetSize/2;
            clientY = e.clientY || rect.top + targetY + targetSize/2;
        }

        effect.style.left = `${clientX - rect.left}px`;
        effect.style.top = `${clientY - rect.top}px`;
        arena.appendChild(effect);

        setTimeout(() => effect.remove(), 400);

        // Cancel the auto-move timeout since player caught it
        clearTimeout(state.targetTimeout);
        
        // Spawn next target immediately
        spawnTarget();
    }

    function startTimer() {
        state.gameInterval = setInterval(() => {
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
        clearInterval(state.gameInterval);
        clearTimeout(state.targetTimeout);

        const arena = document.getElementById('reactionArena');
        if (arena) arena.innerHTML = '<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:1.5rem; color:var(--blue-600); font-weight:bold;">หมดเวลา!</div>';

        setTimeout(() => {
            if (finishCallback) {
                finishCallback(state.score);
            }
        }, 1000);
    }

    function cleanup() {
        state.isPlaying = false;
        if(state.gameInterval) clearInterval(state.gameInterval);
        if(state.targetTimeout) clearTimeout(state.targetTimeout);
        if(container) container.innerHTML = '';
    }

    return {
        init,
        cleanup
    };

})();
