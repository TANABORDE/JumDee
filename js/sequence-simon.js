/* ==========================================================================
   Sequence Simon Game (js/sequence-simon.js)
   Remember the sequence of colors and sounds.
   ========================================================================== */

   window.SequenceSimonGame = (function() {
    
    let container = null;
    let finishCallback = null;
    
    // Game State
    let state = {
        level: 1,
        sequence: [],
        userStep: 0,
        score: 0,
        isPlaying: false,
        stage: 'waiting', // waiting, showing, playing
        colors: [
            { id: 0, color: '#ef4444', class: 'btn-red' }, // red
            { id: 1, color: '#3b82f6', class: 'btn-blue' }, // blue
            { id: 2, color: '#22c55e', class: 'btn-green' }, // green
            { id: 3, color: '#eab308', class: 'btn-yellow' } // yellow
        ]
    };

    const ui = {
        scoreDisplay: document.getElementById('gameScore'),
        timerDisplay: document.getElementById('gameTimer')
    };

    function init(targetContainer, onFinish) {
        container = targetContainer;
        finishCallback = onFinish;
        
        // Similar to grid memory, time is not strictly constrained, level goes up
        ui.timerDisplay.textContent = `ด่าน: ${state.level}`;
        document.getElementById('gameTimerContainer').innerHTML = `ด่าน: <span id="gameTimer">${state.level}</span>`;
        
        resetState();
        renderGameUI();
        setTimeout(startRound, 1000);
    }

    function resetState() {
        state.level = 1;
        state.sequence = [];
        state.userStep = 0;
        state.score = 0;
        state.isPlaying = true;
        state.stage = 'waiting';
        ui.scoreDisplay.textContent = '0';
        ui.timerDisplay = document.getElementById('gameTimer');
        if(ui.timerDisplay) ui.timerDisplay.textContent = state.level;
    }

    function renderGameUI() {
        container.innerHTML = '';
        
        const style = document.createElement('style');
        style.textContent = `
            .simon-arena {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2rem;
                width: 100%;
                max-width: 400px;
            }
            .simon-board {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                width: 100%;
                aspect-ratio: 1/1;
                border-radius: 50%;
                background-color: var(--blue-50);
                padding: 15px;
                box-shadow: inset var(--shadow-sm);
            }
            .simon-btn {
                border-radius: 100%;
                cursor: pointer;
                opacity: 0.6;
                transition: opacity 0.1s, transform 0.1s;
                border: 4px solid var(--primary-white);
            }
            .simon-btn:active {
                transform: scale(0.95);
            }
            .simon-btn.active {
                opacity: 1;
                transform: scale(1.05);
                box-shadow: 0 0 20px currentColor;
            }
            /* Round corners appropriately for a circle slice look */
            .simon-btn:nth-child(1) { border-radius: 100% 10px 10px 10px; background-color: var(--error); color: var(--error); }
            .simon-btn:nth-child(2) { border-radius: 10px 100% 10px 10px; background-color: var(--blue-500); color: var(--blue-500); }
            .simon-btn:nth-child(3) { border-radius: 10px 10px 10px 100%; background-color: var(--success); color: var(--success); }
            .simon-btn:nth-child(4) { border-radius: 10px 10px 100% 10px; background-color: #eab308; color: #eab308; }
            
            .instruction-text {
                font-size: 1.2rem;
                font-weight: 500;
                height: 2rem;
            }
        `;
        container.appendChild(style);

        const arena = document.createElement('div');
        arena.className = 'simon-arena';

        const instr = document.createElement('div');
        instr.id = 'simonInstruction';
        instr.className = 'instruction-text';
        instr.textContent = 'เตรียมตัว...';

        const board = document.createElement('div');
        board.className = 'simon-board';

        state.colors.forEach(col => {
            const btn = document.createElement('div');
            btn.className = `simon-btn ${col.class}`;
            btn.id = `simon-${col.id}`;
            
            // Interaction
            const handlePress = (e) => {
                e.preventDefault();
                handleUserInput(col.id);
            };

            btn.addEventListener('mousedown', handlePress);
            btn.addEventListener('touchstart', handlePress, {passive: false});

            board.appendChild(btn);
        });

        arena.appendChild(instr);
        arena.appendChild(board);
        container.appendChild(arena);
    }

    function playSound(id) {
        // We use web audio api for simple beeps instead of loading files
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            // Frequencies for buttons starting low to high
            const freqs = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C(high)
            
            oscillator.type = 'sine';
            oscillator.frequency.value = freqs[id];
            
            gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
        } catch(e) {
            // Audio context failed (e.g. no interaction), skip silently
        }
    }

    function activateButton(id) {
        const btn = document.getElementById(`simon-${id}`);
        if(!btn) return;
        
        btn.classList.add('active');
        playSound(id);
        
        setTimeout(() => {
            btn.classList.remove('active');
        }, 400); // Hold time
    }

    function startRound() {
        if (!state.isPlaying) return;

        state.stage = 'waiting';
        state.userStep = 0;
        
        // Add new step
        const nextCol = Math.floor(Math.random() * 4);
        state.sequence.push(nextCol);
        
        if(ui.timerDisplay) ui.timerDisplay.textContent = state.level;
        document.getElementById('simonInstruction').textContent = 'จดจำลำดับ';

        setTimeout(() => playSequence(), 800);
    }

    function playSequence(index = 0) {
        if (!state.isPlaying) return;
        state.stage = 'showing';

        if (index < state.sequence.length) {
            activateButton(state.sequence[index]);
            
            // Gap between notes gets shorter as sequence grows, but cap at 200ms
            const gap = Math.max(200, 600 - (state.level * 20));
            
            setTimeout(() => {
                playSequence(index + 1);
            }, 400 + gap); // active time + gap
        } else {
            state.stage = 'playing';
            document.getElementById('simonInstruction').textContent = 'ตาของคุณ (แตะตามลำดับ)';
        }
    }

    function handleUserInput(id) {
        if (state.stage !== 'playing') return;

        activateButton(id);

        if (id === state.sequence[state.userStep]) {
            // Correct logic
            state.userStep++;
            state.score += 5;
            ui.scoreDisplay.textContent = state.score;

            if (state.userStep === state.sequence.length) {
                // Round Complete
                state.stage = 'waiting';
                document.getElementById('simonInstruction').textContent = 'ยอดเยี่ยม!';
                state.level++;
                
                setTimeout(startRound, 1000);
            }
        } else {
            // Wrong tap
            state.stage = 'waiting';
            document.getElementById('simonInstruction').textContent = 'ผิดคิวซะแล้ว';
            
            // Play error sound
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.5);
                osc.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.5);
            } catch(e) {}

            setTimeout(endGame, 1500);
        }
    }

    function endGame() {
        state.isPlaying = false;
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
