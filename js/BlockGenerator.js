import { CONFIG, SHAPES } from './constants.js';

export class BlockGenerator {
    /**
     * 加權隨機選取
     * @param {Array} items - 帶有 weight 屬性的物件陣列
     */
    getWeightedRandom(items) {

        const shuffledItems = items.slice().sort(() => Math.random() - 0.5); // 打亂順序以避免偏差
        let random = Math.random() * 100;
        let difficulty = 0;
        if (random < 2) difficulty = 1;
        if (random < 40 && difficulty === 0) difficulty = 2;
        if (random < 70 && difficulty === 0) difficulty = 3;
        if (random < 90 && difficulty === 0) difficulty = 4;
        if (difficulty === 0) difficulty = 5;

        for (const item of shuffledItems) {
            if (item.difficulty == difficulty) return item;
        }
        return shuffledItems[0];
    }

    spawnShapes(grid) {
        let attempts = 0;
        while (attempts < 100) { // 防止無窮迴圈
            console.log('嘗試次數:', attempts + 1);
            const testShapes = [this.getWeightedRandom(SHAPES), this.getWeightedRandom(SHAPES), this.getWeightedRandom(SHAPES)];
            
            // 取得目前真實網格的副本
            const initialMap = grid.cloneGridState(grid.gridState);
            const hasClear = false;
            // 只要有一種順序能通即可 (或是為了嚴謹，測試所有排列組合)
            if (this.solve(initialMap, testShapes, hasClear, grid)) {
                return testShapes; // 找到可行組合
            }
            attempts++;
        }
        // Not Found
        return [SHAPES[0], SHAPES[0], SHAPES[0]]; 
    }

    /**
     * @param {Map} currentState - 當前的模擬網格
     * @param {Array} remainingShapes - 剩餘未放置的方塊
     */
    solve(currentState, remainingShapes, hasClear, grid) {
        let notOccupiedCount = 0;
        let totalCount = CONFIG.DEFAULT_RADIUS * CONFIG.DEFAULT_RADIUS * 3 + CONFIG.DEFAULT_RADIUS * 3 + 1;
        for (let [key, cell] of currentState) {
            if (!cell.occupied) notOccupiedCount++;
        }
        console.log('目前空格數:', notOccupiedCount, '總格數:', totalCount);
        if (remainingShapes.length === 0){
            console.log('所有方塊已放置完畢');
            console.log('是否有消除:', hasClear);
            if (hasClear || notOccupiedCount / totalCount > CONFIG.NEED_CLEAR_RATIO) return true;
            else return false;
        } 

        const currentShape = remainingShapes[0];
        const nextShapes = remainingShapes.slice(1);

        for (let [key] of currentState) {
            const [q, r] = key.split(',').map(Number);
            const hex = { q, r };

            let newState = grid.testPlace(currentState, hex, currentShape);
            
            if (newState) {
                let {tempState, hasCleared} = grid.testClear(newState);
                newState = tempState;
                if (this.solve(newState, nextShapes, hasCleared || hasClear, grid)) return true;
            }
        }

        return false;
    }
}