import { CONFIG } from './constants.js';

export class Renderer {
    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    constructor(ctx) {
        this.ctx = ctx;
    }

    /**
     * 清除畫布
     */
    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    /**
     * 繪製菜單
     */
    drawMenu() {
        const { width, height } = this.ctx.canvas;
        this.ctx.fillStyle = "#000000cc";
        this.ctx.fillRect(0, 0, width, height);

        this.ctx.save();
        this.ctx.fillStyle = "#d6d6d6ff";
        this.ctx.font = "bold 24px Arial";
        this.ctx.textAlign = "center";
        
        // 繪製目前分數
        this.ctx.fillText(`START GAME`, width / 2, height / 2);
        this.ctx.fillText(`PRESS ANY KEY`, width / 2, height / 2 + 40);
    }

    /**
     * 繪製遊戲結束畫面
     * @param {number} score - 當前分數
     * @param {number} highScore - 最高分
     */
    drawEndScreen(score, highScore) {
        const { width, height } = this.ctx.canvas;
        this.ctx.fillStyle = "#000000cc";
        this.ctx.fillRect(0, 0, width, height);

        this.ctx.save();
        this.ctx.fillStyle = "#d6d6d6ff";
        this.ctx.font = "bold 24px Arial";
        this.ctx.textAlign = "center";

        // 繪製目前分數
        this.ctx.fillText(`GAME OVER`, width / 2, height / 2);
        this.ctx.fillText(`SCORE: ${score}`, width / 2, height / 2 + 40);
        this.ctx.fillText(`HIGH SCORE: ${highScore}`, width / 2, height / 2 + 80);
    }

    /**
     * 繪製分區背景與邊界
     * @param {Object} zones - 包含 main 與 sidebar 的座標資訊
     */
    drawZonesBackground(zones) {
        const { main, sidebar } = zones;

        this.ctx.fillStyle = "#1a1a1a";
        this.ctx.fillRect(main.x, main.y, main.width, main.height);

        this.ctx.fillStyle = "#222222";
        this.ctx.fillRect(sidebar.x, sidebar.y, sidebar.width, sidebar.height);

        this.ctx.strokeStyle = "#333333";
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(sidebar.x, 0);
        this.ctx.lineTo(sidebar.x, sidebar.height);
        this.ctx.stroke();

        const gradient = this.ctx.createLinearGradient(sidebar.x - 20, 0, sidebar.x, 0);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, "rgba(0,0,0,0.5)");
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(sidebar.x - 20, 0, 20, sidebar.height);
    }
    /**
     * 繪製單個六邊形
     * @param {number} x - 像素 X
     * @param {number} y - 像素 Y
     * @param {number} size - 半徑
     * @param {string} color - 顏色
     * @param {number} alpha - 透明度 (0.0 ~ 1.0)
     */
    drawHexagon(x, y, size, color, alpha = 1.0) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle_rad = (Math.PI / 180) * (60 * i - 30);
            const vx = x + size * Math.cos(angle_rad);
            const vy = y + size * Math.sin(angle_rad);
            if (i === 0) this.ctx.moveTo(vx, vy);
            else this.ctx.lineTo(vx, vy);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = "rgba(0,0,0,0.2)";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * 繪製主網格
     * @param {GridManager} gridManager 
     * @param {Object} mainZone - 主區域坐標資訊
     */
    drawGrid(gridManager, mainZone) {
        const centerX = mainZone.width / 2;
        const centerY = mainZone.height / 2;

        gridManager.gridState.forEach((value, key) => {
            const [q, r] = key.split(',').map(Number);
            const screenX = CONFIG.HEX_SIZE * Math.sqrt(3) * (q + r / 2) + centerX;
            const screenY = CONFIG.HEX_SIZE * 3 / 2 * r + centerY;

            const color = value.occupied ? value.color : "#E0E0E0";
            this.drawHexagon(screenX, screenY, CONFIG.HEX_SIZE - 2, color);
        });
    }

    /**
     * 繪製側邊欄待選方塊
     * @param {Array} slots - selectionSlots 陣列
     */
    drawSelectionSlots(slots) {
        slots.forEach(slot => {
            if (!slot.shape) return;

            slot.shape.coords.forEach(([dq, dr]) => {
                const offsetX = (dq + dr / 2) * Math.sqrt(3) * CONFIG.HEX_SIZE * slot.scale;
                const offsetY = dr * 3 / 2 * CONFIG.HEX_SIZE * slot.scale;
                
                this.drawHexagon(
                    slot.x + offsetX,
                    slot.y + offsetY,
                    (CONFIG.HEX_SIZE * slot.scale) - 2,
                    slot.color
                );
            });
        });
    }

    /**
     * 繪製放置預覽 (陰影)
     * @param {Object} hexCoord - {q, r}
     * @param {Object} shape - 方塊數據
     * @param {Object} mainZone 
     */
    drawPlacementPreview(hexCoord, shape, mainZone) {
        const centerX = mainZone.width / 2;
        const centerY = mainZone.height / 2;

        shape.coords.forEach(([dq, dr]) => {
            const q = hexCoord.q + dq;
            const r = hexCoord.r + dr;
            const screenX = CONFIG.HEX_SIZE * Math.sqrt(3) * (q + r / 2) + centerX;
            const screenY = CONFIG.HEX_SIZE * 3 / 2 * r + centerY;

            this.drawHexagon(screenX, screenY, CONFIG.HEX_SIZE - 2, "#000", 0.1);
        });
    }
    
    /**
     * 繪製分數
     * @param {number} score 
     * @param {number} highScore 
     */
    drawScore(score, highScore) {
        this.ctx.save();
        this.ctx.fillStyle = "#d6d6d6ff";
        this.ctx.font = "bold 24px Arial";
        this.ctx.textAlign = "left";
        
        // 繪製目前分數
        this.ctx.fillText(`SCORE: ${score}`, 30, 50);
        
        // 繪製最高分
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "#898888ff";
        this.ctx.fillText(`BEST: ${highScore}`, 30, 80);
        
        this.ctx.restore();
    }

    renderFX(fxManager) {
        fxManager.particles.forEach(p => {
            if (p.prelife > 0) return;
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        this.ctx.globalAlpha = 1.0;
    }


    applyShake(fxManager) {
        if (fxManager.shakeTime > 0) {
            const dx = (Math.random() - 0.5) * fxManager.shakeIntensity;
            const dy = (Math.random() - 0.5) * fxManager.shakeIntensity;
            this.ctx.translate(dx, dy);
        }
        else {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0); 
        }
    }
}