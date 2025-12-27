import { CONFIG, SHAPES } from './constants.js';
import { pixelToHex } from './math.js';
import { hexToPixel } from './math.js';
import { GridManager } from './GridManager.js';
import { Renderer } from './Renderer.js';
import { AudioManager } from './AudioManager.js';
import { FXManager } from './FXManager.js';
import { Theme } from './Theme.js';

// Init
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const renderer = new Renderer(ctx);
const grid = new GridManager(CONFIG.DEFAULT_RADIUS);
const audio = new AudioManager();
const fxManager = new FXManager();

audio.loadSounds({
    pick: 'assets/pick.wav',
    place: 'assets/place.wav',
    clear: 'assets/clear.mp3',
    // error: 'assets/error.wav'
});

// Game State
const state = {
    zones: { main: {}, sidebar: {} },
    selectionSlots: [
        { shape: null, x: 0, y: 0, scale: 0.8, isDragging: false, color: null, originalPos: { x: 0, y: 0 } },
        { shape: null, x: 0, y: 0, scale: 0.8, isDragging: false, color: null, originalPos: { x: 0, y: 0 } },
        { shape: null, x: 0, y: 0, scale: 0.8, isDragging: false, color: null, originalPos: { x: 0, y: 0 } }
    ],

    // Score State
    score: 0,
    endScore: 0,
    highScore: parseInt(localStorage.getItem('hex-high-score')) || 0,
    combo: {
        count: 0,
        timer: 0,
        maxTime: 10000, // ms
    },

    // Mouse Dragging State
    isDragging: false,
    dragTarget: null, // slot
    dragOffset: { x: 0, y: 0 },
    mousePos: { x: 0, y: 0 },
    previewHex: null 
};

// Main Functions
function newGame(newRadius) {
    if (gameState === CONFIG.GAME_STATE.GAME) return;
    gameState = CONFIG.GAME_STATE.GAME;
    gameFinished = false;
    grid.init(newRadius);
    spawnShapes();
}


function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function spawnShapes() {
    const allEmpty = state.selectionSlots.every(s => s.shape === null);
    if (allEmpty) {
        state.selectionSlots.forEach(slot => {
            slot.shape = getRandomItem(SHAPES);
            slot.color = getRandomItem(CONFIG.COLORS);
            slot.scale = 0.8;
            slot.x = slot.originalPos.x;
            slot.y = slot.originalPos.y;
        });
    }
}

function updateZones() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const isPortrait = canvas.height > canvas.width;

    if (isPortrait) {
        const bh = canvas.height * 0.25; 
        state.zones.main = { x: 0, y: 0, width: canvas.width, height: canvas.height - bh };
        state.zones.sidebar = { x: 0, y: canvas.height - bh, width: canvas.width, height: bh };

        state.selectionSlots.forEach((slot, i) => {
            const targetX = (state.zones.sidebar.width / 4) * (i + 1);
            const targetY = state.zones.sidebar.y + state.zones.sidebar.height / 2;
            slot.originalPos = { x: targetX, y: targetY };
            if (!slot.isDragging) {
                slot.x = targetX;
                slot.y = targetY;
            }
        });
    } else {
        const sw = canvas.width * 0.25;
        state.zones.sidebar = { x: canvas.width - sw, y: 0, width: sw, height: canvas.height };
        state.zones.main = { x: 0, y: 0, width: canvas.width - sw, height: canvas.height };

        state.selectionSlots.forEach((slot, i) => {
            const targetX = state.zones.sidebar.x + state.zones.sidebar.width / 2;
            const targetY = (state.zones.sidebar.height / 4) * (i + 1);
            slot.originalPos = { x: targetX, y: targetY };
            if (!slot.isDragging) {
                slot.x = targetX;
                slot.y = targetY;
            }
        });
    }
    const padding = 80;
    const minDimension = Math.min(state.zones.main.width, state.zones.main.height) - padding;
    // 六邊形網格總寬度約為 (radius * 2 + 1) * hex_width
    // hex_width = hex_size * sqrt(3)
    CONFIG.DEFAULT_HEX_SIZE = minDimension / ((grid.radius * 2 + 1) * 1.732);
}

function checkGameOver() {
    for (const slot of state.selectionSlots) {
        if (slot.shape && grid.canPlaceAny(slot.shape)) {
            return false;
        }
    }
    return true;
}

function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
        x: clientX - rect.left,
        y: clientY - rect.top,
        isTouch: !!e.touches
    };
}

// Event Listeners
const handleStart = (e) => {
    if (e.type === 'touchstart') e.preventDefault(); // 防止手機預設行為
    audio.play('pick');
    newGame(CONFIG.DEFAULT_RADIUS);
    const pos = getPointerPos(e);

    state.selectionSlots.forEach(slot => {
        if (!slot.shape) return;
        const dist = Math.hypot(pos.x - slot.x, pos.y - slot.y);
        if (dist < CONFIG.DEFAULT_HEX_SIZE * 2.5) { 
            state.isDragging = true;
            state.dragTarget = slot;
            slot.isDragging = true;
            state.dragOffset = { x: pos.x - slot.x, y: pos.y - slot.y };
            state.dragTarget.scale = 0.7;
        }
    });
}

const handleMove = (e) => {
    const pos = getPointerPos(e);
    if (state.isDragging && state.dragTarget) {
        // 優化：如果是觸控，將方塊往上移 50px，避免手指遮擋
        const touchOffsetY = pos.isTouch ? 50 : 0; 
        
        state.dragTarget.x = pos.x - state.dragOffset.x;
        state.dragTarget.y = pos.y - state.dragOffset.y - touchOffsetY;

        if (state.dragTarget.x < state.zones.main.width) {
            state.dragTarget.scale = Math.min(1.0, state.dragTarget.scale + 0.1);
            const hex = pixelToHex(state.dragTarget.x, state.dragTarget.y, state.zones.main.width / 2, state.zones.main.height / 2 + CONFIG.DELTA_Y);
            state.previewHex = grid.canPlace(hex, state.dragTarget.shape) ? hex : null;
        } else {
            state.dragTarget.scale = Math.max(0.7, state.dragTarget.scale - 0.1);
            state.previewHex = null;
        }
    }
}

const handleEnd = (e) => {
    if (!state.isDragging || !state.dragTarget) return;

    const hex = pixelToHex(state.dragTarget.x, state.dragTarget.y, state.zones.main.width / 2, state.zones.main.height / 2 + CONFIG.DELTA_Y);
    
    if (grid.canPlace(hex, state.dragTarget.shape)) {
        const placementScore = state.dragTarget.shape.coords.length * CONFIG.SCORE.PER_TILE;
        state.score += placementScore;

        grid.place(hex, state.dragTarget.shape, state.dragTarget.color);
        audio.play('place');

        const clearInfo = grid.checkAndClearLines();
        const uniqueCoords = clearInfo.grid;
        const linesCleared = clearInfo.linesCleared;
        uniqueCoords.forEach(key => {

            const pixelPos = hexToPixel(
                parseInt(key.q),
                parseInt(key.r),
                state.zones.main.width / 2,
                state.zones.main.height / 2
            );

            fxManager.createExplosion(
                pixelPos.x,
                pixelPos.y,
                key.color,
                0.5,
                0
            );

        });

        if (linesCleared > 0) {
            const clearScore = Math.floor(linesCleared * CONFIG.SCORE.LINE_BASE * (1 + (linesCleared - 1) * CONFIG.SCORE.COMBO_BONUS));
            state.score += clearScore;
            state.combo.count += 1;
            state.combo.timer = state.combo.maxTime; // 重置連擊計時器
            audio.play('clear');
            fxManager.createFloatingText(state.dragTarget.x, state.dragTarget.y, `+${clearScore}`, state.dragTarget.color, 50);
            fxManager.createFloatingText(state.dragTarget.x, state.dragTarget.y + 30, `COMBO x${state.combo.count}`, state.dragTarget.color, 30);
            fxManager.triggerShake(linesCleared * 5, 15);
            if (linesCleared >= 3 || state.combo.count >= 5) Theme.nextTheme();
            
        }

        if (state.score > state.highScore) {
            state.highScore = state.score;
            localStorage.setItem('hex-high-score', state.highScore);
        }
        state.dragTarget.shape = null;
        spawnShapes();
    } 
    else {
        state.dragTarget.x = state.dragTarget.originalPos.x;
        state.dragTarget.y = state.dragTarget.originalPos.y;
        state.dragTarget.scale = 0.8;
    }

    state.dragTarget.isDragging = false;
    state.isDragging = false;
    state.dragTarget = null;
    state.previewHex = null;
}

window.addEventListener('keydown', (e) => {
    let newRadius = CONFIG.DEFAULT_RADIUS;
    if ('1' < e.key && e.key <= '5' && gameState !== CONFIG.GAME_STATE.GAME){
        newRadius = parseInt(e.key);
        console.log('Set grid radius to', newRadius);
    } 
    newGame(newRadius);
});

window.addEventListener('resize', updateZones);


canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);

canvas.addEventListener('touchstart', handleStart, { passive: false });
canvas.addEventListener('touchmove', handleMove, { passive: false });
canvas.addEventListener('touchend', handleEnd);

// Main Game Loop

function gameLogic() {
    if(checkGameOver() && !gameFinished){
        gameFinished = true;
        state.endScore = state.score;
        state.score = 0;
        
        const tasks = grid.startDissolve();

        tasks.forEach(task => {
            const centerX = state.zones.main.width / 2;
            const centerY = state.zones.main.height / 2;
            const pixelPos = hexToPixel(task.q, task.r, centerX, centerY);

            fxManager.createExplosion(pixelPos.x, pixelPos.y, task.color, 1.0, task.delay);
        });

        state.selectionSlots.forEach(slot => slot.shape = null);
    } 

    if (gameFinished && fxManager.particles.length === 0) {
        gameState = CONFIG.GAME_STATE.OVER;
        return;
    }
    
    if (grid.updateDissolve()) {
        audio.play('place');
        Theme.nextTheme();
    }

    if (state.combo.timer > 0) {
        state.combo.timer -= 1 / CONFIG.FPS * 1000;
        if (state.combo.timer <= 0) {
            state.combo.count = 0;
            Theme.setTheme('lava');
        }
    }

    fxManager.update();
}

function gameRender() {
    renderer.clear();

    renderer.drawZonesBackground(state.zones);
    renderer.drawGrid(grid, state.zones.main);

    if (state.previewHex && state.dragTarget) {
        renderer.drawPlacementPreview(state.previewHex, state.dragTarget.shape, state.zones.main);
    }

    renderer.drawDisplayScore(state.score, state.highScore, state.combo, state.zones);
    renderer.drawSelectionSlots(state.selectionSlots);
    renderer.renderFX(fxManager);
    renderer.applyShake(fxManager);
}

function gameScene() {
    gameLogic();
    gameRender();
}

function menuScene() {
    renderer.clear();
    renderer.drawMenu();
}

function endScene() {
    renderer.clear();
    renderer.drawEndScreen(state.endScore, state.highScore);
}

let gameState = CONFIG.GAME_STATE.MENU;
let gameFinished = false;

function gameLoop(timestamp) {
    if (gameState === CONFIG.GAME_STATE.GAME) {
        gameScene();
    } 
    else if (gameState === CONFIG.GAME_STATE.MENU) {
        menuScene();
    }
    else if (gameState === CONFIG.GAME_STATE.OVER) {
        endScene();
    }
    requestAnimationFrame(gameLoop);
}

// Start the Game
updateZones();
spawnShapes();
gameLoop();