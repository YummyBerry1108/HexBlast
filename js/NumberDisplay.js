import { CONFIG } from './constants.js';

export class NumberDisplay {
    constructor(ctx) {
        this.ctx = ctx;
        // 定義每個數字對應哪些段落 (A-G)
        //     A
        //   F   B
        //     G
        //   E   C
        //     D
        this.digitMap = {
            '0': [1,1,1,1,1,1,0], // A,B,C,D,E,F
            '1': [0,1,1,0,0,0,0], // B,C
            '2': [1,1,0,1,1,0,1], // A,B,D,E,G
            '3': [1,1,1,1,0,0,1],
            '4': [0,1,1,0,0,1,1],
            '5': [1,0,1,1,0,1,1],
            '6': [1,0,1,1,1,1,1],
            '7': [1,1,1,0,0,0,0],
            '8': [1,1,1,1,1,1,1],
            '9': [1,1,1,1,0,1,1]
        };
    }

    /**
     * 繪製單個段落
     */
    drawSegment(x, y, width, height, isHorizontal, isActive) {
        this.ctx.fillStyle = isActive ? "#00FF99" : "#2d2d2d"; // 亮色/背景暗色
        this.ctx.shadowBlur = isActive ? 10 : 0;
        this.ctx.shadowColor = "#00FF99";
        
        // 繪製六邊形或菱形風格的段落
        this.ctx.fillRect(x, y, width, height); 
        this.ctx.shadowBlur = 0;
    }

    /**
     * 繪製完整數字
     */
    drawDigit(number, x, y, size) {
        const segments = this.digitMap[number] || [0,0,0,0,0,0,0];
        const w = size;         // 段落長度
        const t = size * 0.2;   // 段落寬度

        // 座標定義 (A-G)
        const layout = [
            { x: x + t, y: y, w: w, h: t, horiz: true },          // A
            { x: x + t + w, y: y + t, w: t, h: w, horiz: false }, // B
            { x: x + t + w, y: y + 2 * t + w, w: t, h: w, horiz: false }, // C
            { x: x + t, y: y + 2 * t + 2 * w, w: w, h: t, horiz: true }, // D
            { x: x, y: y + 2 * t + w, w: t, h: w, horiz: false }, // E
            { x: x, y: y + t, w: t, h: w, horiz: false },         // F
            { x: x + t, y: y + t + w, w: w, h: t, horiz: true }   // G
        ];

        layout.forEach((pos, i) => {
            this.drawSegment(pos.x, pos.y, pos.w, pos.h, pos.horiz, segments[i] === 1);
        });
    }

    /**
     * 繪製帶邊框的固定位數顯示器
     * @param {number} score - 目前分數
     * @param {number} x - 起始 X
     * @param {number} y - 起始 Y
     * @param {number} size - 數字大小
     * @param {number} maxDigits - 固定顯示位數
     */
    drawScore(score, x, y, size, maxDigits = CONFIG.MAX_DIGITS) {
        const spacing = size * CONFIG.SCORE_SPACE;        // 數字間距
        const charWidth = size + size * 0.4; // 單個數字寬度
        const charHeight = size * 2 + size * 0.6; // 單個數字高度
        const padding = 10;                // 內邊距

        // 1. 計算總寬度並繪製外框背景
        const totalWidth = maxDigits * spacing + padding;
        const totalHeight = charHeight + padding * 2;

        // 繪製外框
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = "#333";     // 邊框顏色
        this.ctx.fillStyle = "#111";       // 顯示器底色
        
        // 繪製圓角矩形 (或一般矩形)
        this.ctx.beginPath();
        this.ctx.roundRect(x - padding, y - padding, totalWidth, totalHeight, 5);
        this.ctx.fill();
        this.ctx.stroke();

        // 2. 處理數字字串 (固定位數，不足補 0 或空格)
        // 使用 '0' 補齊，若想讓前方不顯示則改用 .padStart(maxDigits, ' ')
        const scoreStr = score.toString().padStart(maxDigits, '0');

        // 3. 繪製數字
        for (let i = 0; i < scoreStr.length; i++) {
            const char = scoreStr[i];
            const posX = x + i * spacing;
            
            // 繪製背景底色段落 (選擇性：增加真實感)
            this.drawDigitBackground(posX, y, size);
            
            // 繪製實際數字
            if (char !== ' ') {
                this.drawDigit(char, posX, y, size);
            }
        }
    }

    /**
     * 繪製暗色的 8 作為背景底色 (電子鐘常見視覺)
     */
    drawDigitBackground(x, y, size) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.05; // 極低透明度
        this.drawDigit('8', x, y, size);
        this.ctx.restore();
    }
}