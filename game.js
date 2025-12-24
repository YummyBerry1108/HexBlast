const canvas = document.getElementById('gameCanvas');
const canvaWidth = window.innerWidth;
const canvaHeight = window.innerHeight;
const ctx = canvas.getContext('2d');

// Hex Settings
const HEX_SIZE = 35; // 六邊形外接圓半徑
const RADIUS = 5; // 網格大小
const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#9B59B6'];
// 網格狀態儲存
// Key: "q,r", Value: { occupied: boolean, color: string }
// q is --> (水平方向)
// r is \ (左上到右下方向)
const gridState = new Map();

// Zone Definitions
let zones = {
    main: { x: 0, y: 0, width: 0, height: 0 },
    sidebar: { x: 0, y: 0, width: 0, height: 0 }
};

// Shape Definitions
const SHAPES = [
    { name: 'Slash', coords: [[0,0], [0,1], [0,-1]] },
    { name: 'Small-Triangle', coords: [[0,0], [0,-1], [-1,0]] },
    { name: 'Small-Triangle-Reversed', coords: [[0,0], [-1,1], [-1,0]] },
];

// Selection Slots
let selectionSlots = [
    { shape: null, x: 0, y: 0, scale: 0.8, isDragging: false, color: getRandomItem(COLORS) },
    { shape: null, x: 0, y: 0, scale: 0.8, isDragging: false, color: getRandomItem(COLORS) },
    { shape: null, x: 0, y: 0, scale: 0.8, isDragging: false, color: getRandomItem(COLORS) }
];

// Mouse Dragging State
let isDragging = false;
let dragTarget = null; // 指向 selectionSlots 中的某個物件
let dragOffset = { x: 0, y: 0 }; // 修正點擊位置與方塊中心的偏移
let mousePos = { x: 0, y: 0 };

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function canvaSizeChange() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateZones();
    drawGrid(RADIUS);
    drawSelectionSlots();
}

/**
 * 像素座標轉六邊形軸向座標
 */
function pixelToHex(px, py) {
    // 扣除畫布中心偏移量
    const currX = px - (zones.main.x + zones.main.width / 2);
    const currY = py - (zones.main.y + zones.main.height / 2);

    // 軸向座標轉換公式
    const q = (Math.sqrt(3)/3 * currX - 1/3 * currY) / HEX_SIZE;
    const r = (2/3 * currY) / HEX_SIZE;

    // 進行六邊形捨入 (Hex Rounding)
    return hexRound(q, r);
}

function hexRound(fracQ, fracR) {
    let fracS = -fracQ - fracR;
    let q = Math.round(fracQ);
    let r = Math.round(fracR);
    let s = Math.round(fracS);

    const qDiff = Math.abs(q - fracQ);
    const rDiff = Math.abs(r - fracR);
    const sDiff = Math.abs(s - fracS);

    if (qDiff > rDiff && qDiff > sDiff) {
        q = -r - s;
    } else if (rDiff > sDiff) {
        r = -q - s;
    }
    return { q, r };
}

// 初始化一個半徑為 4 的大六邊形網格 (共 61 格)
function initGrid(radius) {
    for (let q = -radius; q <= radius; q++) {
        let r1 = Math.max(-radius, -q - radius);
        let r2 = Math.min(radius, -q + radius);
        for (let r = r1; r <= r2; r++) {
            gridState.set(`${q},${r}`, { occupied: false, color: null });
        }
    }
}


/**
 * 繪製單個六邊形
 * @param {number} x - 中心點 X 座標
 * @param {number} y - 中心點 Y 座標
 * @param {number} size - 外接圓半徑 (中心到頂點距離)
 * @param {string} color - 填充顏色
 */
function drawHexagon(x, y, size, color) {
    ctx.beginPath();
    // 循環 6 個頂點
    for (let i = 0; i < 6; i++) {
        const angle_deg = 60 * i - 30; // 尖角向上起始角度為 -30度
        const angle_rad = (Math.PI / 180) * angle_deg;
        
        const vx = x + size * Math.cos(angle_rad);
        const vy = y + size * Math.sin(angle_rad);
        
        if (i === 0) {
            ctx.moveTo(vx, vy);
        } else {
            ctx.lineTo(vx, vy);
        }
    }
    ctx.closePath();

    // 填色與描邊
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#333"; // 格線顏色
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawGrid(radius) {
    for (let q = -radius; q <= radius; q++) {
        let r1 = Math.max(-radius, -q - radius);
        let r2 = Math.min(radius, -q + radius);
        for (let r = r1; r <= r2; r++) {
            // 座標轉換公式
            const screenX = HEX_SIZE * Math.sqrt(3) * (q + r / 2) + zones.main.width / 2;
            const screenY = HEX_SIZE * 3/2 * r + zones.main.height / 2;
            const color = gridState.get(`${q},${r}`).color || "#cfcfcf";
            drawHexagon(screenX, screenY, HEX_SIZE - 2, color); // 減2是為了留空隙
        }
    }
}

function updateZones() {
    const sw = canvas.width * 0.25; // 側邊欄佔 25% 寬度
    zones.sidebar = { x: canvas.width - sw, y: 0, width: sw, height: canvas.height };
    zones.main = { x: 0, y: 0, width: canvas.width - sw, height: canvas.height };

    // 設定 3 個 Slot 的中心位置
    selectionSlots.forEach((slot, i) => {
        if(slot.isDragging) return; // 拖曳中不更新位置
        slot.x = zones.sidebar.x + zones.sidebar.width / 2;
        slot.y = (zones.sidebar.height / 4) * (i + 1);
    });
}

function drawSelectionSlots() {
    for (let i = 0; i < selectionSlots.length; i++) {
        const slot = selectionSlots[i];
        if (slot.shape) {
            for (const [dq, dr] of slot.shape.coords) {
                const screenX = slot.x + (dq + dr / 2) * HEX_SIZE * Math.sqrt(3) * slot.scale;
                const screenY = slot.y + dr * HEX_SIZE * 3/2 * slot.scale;
                drawHexagon(screenX, screenY, HEX_SIZE * slot.scale - 2, slot.color || "#9b538f" );
                // if(slot.isDragging) console.log(slot);
            }
        }
    }
}

// 取得滑鼠在畫布上的相對座標
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

canvas.addEventListener('mousedown', (e) => {
    mousePos = getMousePos(e);
    
    // 檢查是否點擊到側邊欄的方塊
    selectionSlots.forEach(slot => {
        if (!slot.shape) return;

        // 簡單的圓形碰撞檢測 (可用 HEX_SIZE * 2 作為檢測範圍)
        const dist = Math.hypot(mousePos.x - slot.x, mousePos.y - slot.y);
        if (dist < HEX_SIZE * 2) {
            isDragging = true;
            dragTarget = slot;
            dragTarget.isDragging = true;
            dragOffset.x = mousePos.x - slot.x;
            dragOffset.y = mousePos.y - slot.y;
            dragTarget.scale = 0.7; // 放大方塊
        }
    });
});

canvas.addEventListener('mousemove', (e) => {
    mousePos = getMousePos(e);
    
    if (isDragging && dragTarget) {
        // 更新方塊位置（跟隨滑鼠）
        dragTarget.x = mousePos.x - dragOffset.x;
        dragTarget.y = mousePos.y - dragOffset.y;
        // console.log("Dragging", dragTarget);
        // 進入主區域時，平滑放大 scale
        if (dragTarget.x < zones.main.width) {
            dragTarget.scale = Math.min(1.0, dragTarget.scale + 0.1);
        } else {
            dragTarget.scale = Math.max(0.7, dragTarget.scale - 0.1);
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (!isDragging || !dragTarget) return;

    // 1. 計算目前的六邊形座標
    const hexCoord = pixelToHex(dragTarget.x, dragTarget.y);
    
    // 2. 嘗試放置方塊
    if (canPlaceShape(hexCoord, dragTarget.shape)) {
        placeShape(hexCoord, dragTarget.shape);
        dragTarget.shape = null; // 清空該欄位
        checkLines();            // 檢查消除
        spawnNewShapesIfEmpty(); // 若三格都空了就補貨
    }

    dragTarget.isDragging = false;
    isDragging = false;
    dragTarget = null;
});

/**
 * 檢查方塊是否可以放置在該位置
 * @param {Object} center - 軸向座標 {q, r}
 * @param {Object} shape - 方塊定義的相對座標列表
 */
function canPlaceShape(center, shape) {
    for (let relCoord of shape.coords) {
        const q = center.q + relCoord[0];
        const r = center.r + relCoord[1];
        const cell = gridState.get(`${q},${r}`);

        // 若超出邊界或已被佔據，則不能放置
        if (!cell || cell.occupied) return false;
    }
    return true;
}

function placeShape(center, shape) {
    shape.coords.forEach(relCoord => {
        const q = center.q + relCoord[0];
        const r = center.r + relCoord[1];
        gridState.set(`${q},${r}`, { occupied: true, color: dragTarget.color});
    });
}

function checkLines() {
    // 水平
    for (let r = -RADIUS; r <= RADIUS; r++) {
        let fullLine = true;
        for (let q = -RADIUS; q <= RADIUS; q++) {
            const cell = gridState.get(`${q},${r}`);
            if(!cell) continue;
            if (!cell.occupied) {
                fullLine = false;
                break;
            }
        }
        if (fullLine) {
            // 消除整行
            for (let q = -RADIUS; q <= RADIUS; q++) {
                if(!gridState.get(`${q},${r}`)) continue;
                gridState.set(`${q},${r}`, { occupied: false, color: null });
            }
        }
    }

    // 斜線 \
    for (let q = -RADIUS; q <= RADIUS; q++) {
        let fullLine = true;
        for (let r = -RADIUS; r <= RADIUS; r++) {
            const cell = gridState.get(`${q},${r}`);
            if(!cell) continue;
            console.log(cell);
            if (!cell.occupied) {
                fullLine = false;
                break;
            }
        }
        if (fullLine) {
            // 消除整行
            for (let r = -RADIUS; r <= RADIUS; r++) {
                if(!gridState.get(`${q},${r}`)) continue;
                gridState.set(`${q},${r}`, { occupied: false, color: null });
            }
        }
    }

    for (let q = -RADIUS; q <= RADIUS; q++) {
        let fullLine = true;
        for (let r = -RADIUS; r <= RADIUS; r++) {
            const cell = gridState.get(`${q+r},${-r}`);
            if(!cell) continue;
            if (!cell.occupied) {
                fullLine = false;
                break;
            }
        }
        if (fullLine) {
            // 消除整行
            for (let r = -RADIUS; r <= RADIUS; r++) {
                if(!gridState.get(`${q+r},${-r}`)) continue;
                gridState.set(`${q+r},${-r}`, { occupied: false, color: null });
            }
        }
    }

}

function spawnNewShapesIfEmpty() {
    const allEmpty = selectionSlots.every(slot => slot.shape === null);
    if (allEmpty) {
        selectionSlots.forEach(slot => {
            const randomShape = getRandomItem(SHAPES);
            slot.scale = 0.8;
            slot.shape = randomShape;
            slot.color = getRandomItem(COLORS);
        });
    }
}

selectionSlots[0].shape = SHAPES[0];
selectionSlots[1].shape = SHAPES[1];
selectionSlots[2].shape = SHAPES[2];

initGrid(RADIUS);
canvaSizeChange();

window.addEventListener('resize', canvaSizeChange);

// Game Loop with Fixed FPS

const MAX_FPS = 60;
const FRAME_INTERVAL_MS = 1000 / MAX_FPS;

function update() {
  setTimeout(() => {
    render()
    update();
  }, FRAME_INTERVAL_MS);
}
update();