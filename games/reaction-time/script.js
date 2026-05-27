// Game elements
const target = document.getElementById('target');
const startBtn = document.getElementById('start-btn');
const reactionTimeDisplay = document.getElementById('reaction-time');
const bestTimeDisplay = document.getElementById('best-time');
const gameArea = document.querySelector('.game-area');

// Audio context for sound effects
let audioContext = null;
let soundEnabled = false;

// Game state
let gameStarted = false;
let startTime = 0;
let bestTime = localStorage.getItem('bestReactionTime') || '--';

// Initialize
bestTimeDisplay.textContent = bestTime;

// Start button event listener
startBtn.addEventListener('click', startGame);

// Target click event listener
target.addEventListener('click', handleTargetClick);

// Initialize audio context on first user interaction
function initAudio() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            soundEnabled = true;
            console.log('Audio context initialized successfully!');
        } catch (e) {
            console.log('Failed to initialize audio context:', e);
            soundEnabled = false;
        }
    }
}

// Initialize audio on any user interaction
startBtn.addEventListener('click', initAudio);
target.addEventListener('click', initAudio);

function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    startBtn.textContent = 'Waiting...';
    startBtn.classList.add('waiting');
    gameArea.classList.add('waiting');
    
    // Hide target initially
    target.style.display = 'none';
    target.classList.remove('clicked');
    
    // Random delay between 1-5 seconds
    const delay = Math.random() * 4000 + 1000;
    
    setTimeout(() => {
        if (gameStarted) {
            showTarget();
        }
    }, delay);
}

function showTarget() {
    // Random position within game area
    const gameAreaRect = gameArea.getBoundingClientRect();
    const targetSize = 60;
    
    const maxX = gameAreaRect.width - targetSize;
    const maxY = gameAreaRect.height - targetSize;
    
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    
    target.style.left = x + 'px';
    target.style.top = y + 'px';
    target.style.display = 'block';
    
    // Play sound effect
    console.log('Attempting to play sound...');
    playTargetSound();
    
    // Record start time
    startTime = Date.now();
}

// Play target sound using Web Audio API
function playTargetSound() {
    if (!soundEnabled || !audioContext) {
        console.log('Audio not enabled or context not available');
        return;
    }
    
    try {
        // Create oscillator for the main tone
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Create a "pop" sound with frequency sweep
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
        oscillator.type = 'sine';
        
        // Volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        
        console.log('Target sound played successfully!');
    } catch (e) {
        console.log('Failed to play target sound:', e);
    }
}

function handleTargetClick() {
    if (!gameStarted || !startTime) return;
    
    const reactionTime = Date.now() - startTime;
    
    // Update displays
    reactionTimeDisplay.textContent = reactionTime;
    
    // Update best time if better
    if (bestTime === '--' || reactionTime < parseInt(bestTime)) {
        bestTime = reactionTime;
        bestTimeDisplay.textContent = bestTime;
        localStorage.setItem('bestReactionTime', bestTime);
    }
    
    // Visual feedback
    target.classList.add('clicked');
    
    // Reset game after a short delay
    setTimeout(() => {
        resetGame();
    }, 1000);
}

function resetGame() {
    gameStarted = false;
    startTime = 0;
    target.style.display = 'none';
    target.classList.remove('clicked');
    startBtn.textContent = 'Start Game';
    startBtn.classList.remove('waiting');
    gameArea.classList.remove('waiting');
}

// Prevent clicking target before it appears
gameArea.addEventListener('click', (e) => {
    if (e.target === gameArea && gameStarted && !startTime) {
        // Clicked too early - reset game
        resetGame();
        alert('Too early! Wait for the target to appear.');
    }
}); 
