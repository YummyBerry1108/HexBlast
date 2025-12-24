import { CONFIG, SHAPES } from './constants.js';
import { pixelToHex } from './math.js';
import { GridManager } from './GridManager.js';
import { Renderer } from './Renderer.js';

// 1. 初始化環境
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const grid = new GridManager(CONFIG.RADIUS);
const renderer = new Renderer(ctx);

// 2. 遊戲狀態管理
const state = {
    zones: { main: {}, sidebar: {} },
    selectionSlots: [
        { shape: null, x: 0, y: 0, scale: 0.8, isDragging: false, color: null, originalPos: { x: 0, y: 0 } },
        { shape: null, x: 0, y: 0, scale: 0.8, isDragging: false, color: null, originalPos: { x: 0, y: 0 } },
        { shape: null, x: 0, y: 0, scale: 0.8, isDragging: false, color: null, originalPos: { x: 0, y: 0 } }
    ],
    isDragging: false,
    dragTarget: null,
    dragOffset: { x: 0, y: 0 },
    mousePos: { x: 0, y: 0 },
    previewHex: null // 用於顯示放置預覽
};

// 3. 核心邏輯函式
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

// 4. 事件監聽處理
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    state.mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    state.selectionSlots.forEach(slot => {
        if (!slot.shape) return;
        const dist = Math.hypot(state.mousePos.x - slot.x, state.mousePos.y - slot.y);
        if (dist < CONFIG.HEX_SIZE * 2) {
            state.isDragging = true;
            state.dragTarget = slot;
            slot.isDragging = true;
            state.dragOffset = { x: state.mousePos.x - slot.x, y: state.mousePos.y - slot.y };
        }
    });
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    state.mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (state.isDragging && state.dragTarget) {
        state.dragTarget.x = state.mousePos.x - state.dragOffset.x;
        state.dragTarget.y = state.mousePos.y - state.dragOffset.y;

        // 處理縮放與預覽邏輯
        if (state.dragTarget.x < state.zones.main.width) {
            state.dragTarget.scale = Math.min(1.0, state.dragTarget.scale + 0.1);
            const hex = pixelToHex(state.dragTarget.x, state.dragTarget.y, state.zones.main.width / 2, state.zones.main.height / 2);
            state.previewHex = grid.canPlace(hex, state.dragTarget.shape) ? hex : null;
        } else {
            state.dragTarget.scale = Math.max(0.8, state.dragTarget.scale - 0.1);
            state.previewHex = null;
        }
    }
});

canvas.addEventListener('mouseup', () => {
    if (!state.isDragging || !state.dragTarget) return;

    const hex = pixelToHex(state.dragTarget.x, state.dragTarget.y, state.zones.main.width / 2, state.zones.main.height / 2);

    if (grid.canPlace(hex, state.dragTarget.shape)) {
        grid.place(hex, state.dragTarget.shape, state.dragTarget.color);
        state.dragTarget.shape = null;
        grid.checkAndClearLines();
        spawnShapes();
    } else {
        // 彈回原位
        state.dragTarget.x = state.dragTarget.originalPos.x;
        state.dragTarget.y = state.dragTarget.originalPos.y;
        state.dragTarget.scale = 0.8;
    }

    state.dragTarget.isDragging = false;
    state.isDragging = false;
    state.dragTarget = null;
    state.previewHex = null;
});

window.addEventListener('resize', updateZones);

// 5. 遊戲主迴圈 (Main Loop)
function gameLoop() {
    renderer.clear();
    
    // 繪製順序：背景網格 -> 預覽陰影 -> 側邊欄方塊 -> 拖拽中的方塊
    renderer.drawGrid(grid, state.zones.main);
    
    if (state.previewHex && state.dragTarget) {
        renderer.drawPlacementPreview(state.previewHex, state.dragTarget.shape, state.zones.main);
    }

    renderer.drawSelectionSlots(state.selectionSlots);

    requestAnimationFrame(gameLoop);
}

// 6. 啟動遊戲
updateZones();
spawnShapes();
gameLoop();