export class GridManager {
    constructor(radius) {
        this.radius = radius;
        this.gridState = new Map();
        this.init();
    }

    init() {
        for (let q = -this.radius; q <= this.radius; q++) {
            let r1 = Math.max(-this.radius, -q - this.radius);
            let r2 = Math.min(this.radius, -q + this.radius);
            for (let r = r1; r <= r2; r++) {
                this.gridState.set(`${q},${r}`, { occupied: false, color: null });
            }
        }
    }

    canPlace(center, shape) {
        for (let relCoord of shape.coords) {
        const q = center.q + relCoord[0];
        const r = center.r + relCoord[1];
        const cell = this.gridState.get(`${q},${r}`);

        // 若超出邊界或已被佔據，則不能放置
        if (!cell || cell.occupied) return false;
    }
    return true;}

    canPlaceAny(shape) {
        for (let [key, cell] of this.gridState) {
            if (!cell.occupied) {
                const center = { q: parseInt(key.split(',')[0]), r: parseInt(key.split(',')[1]) };
                if (this.canPlace(center, shape)) return true;
            }
        }
        return false;
    }

    place(center, shape, color) {
        shape.coords.forEach(relCoord => {
            const q = center.q + relCoord[0];
            const r = center.r + relCoord[1];
            this.gridState.set(`${q},${r}`, { occupied: true, color: color});
        });
    }
    checkAndClearLines() {
        let linesToClear = []; // 儲存所有需要消除的格子座標清單
        let clearedCount = 0;
        let clearedInfo = {
            grid: [],
            linesCleared: 0
        };

        // 1. 檢查 r 軸 (水平線)
        for (let r = -this.radius; r <= this.radius; r++) {
            let line = [];
            for (let q = -this.radius; q <= this.radius; q++) {
                if (this.gridState.has(`${q},${r}`)) line.push(`${q},${r}`);
            }
            if (this.isLineFull(line)) {
                linesToClear.push(...line);
                clearedCount++;
            }
        }

        // 2. 檢查 q 軸 (左斜線 \)
        for (let q = -this.radius; q <= this.radius; q++) {
            let line = [];
            for (let r = -this.radius; r <= this.radius; r++) {
                if (this.gridState.has(`${q},${r}`)) line.push(`${q},${r}`);
            }
            if (this.isLineFull(line)) {
                linesToClear.push(...line);
                clearedCount++;
            }
        }

        // 3. 檢查 s 軸 (右斜線 /): 特徵是 q + r = k
        for (let k = -this.radius; k <= this.radius; k++) {
            let line = [];
            for (let q = -this.radius; q <= this.radius; q++) {
                let r = k - q; // 因為 q + r = k
                if (this.gridState.has(`${q},${r}`)) line.push(`${q},${r}`);
            }
            if (this.isLineFull(line)) {
                linesToClear.push(...line);
                clearedCount++;
            }
        }

        // 執行消除 (使用 Set 避免重複消除交叉點的格子)
        const uniqueCoords = [...new Set(linesToClear)];
        uniqueCoords.forEach(key => {
            clearedInfo.grid.push({
                q: parseInt(key.split(',')[0]),
                r: parseInt(key.split(',')[1]),
                color: this.gridState.get(key).color
            });
            this.gridState.set(key, { occupied: false, color: null });
        });
        clearedInfo.linesCleared = clearedCount;
        
        return clearedInfo;
    }

    isLineFull(lineKeys) {
        if (lineKeys.length === 0) return false;
        return lineKeys.every(key => this.gridState.get(key).occupied);
    }

}