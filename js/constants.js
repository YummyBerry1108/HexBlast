export const CONFIG = {
    FPS: 60,
    DEFAULT_HEX_SIZE: 35,
    DEFAULT_RADIUS: 5,
    COLORS: ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#9B59B6'],
    SCORE: {
        PER_TILE: 10,       // 放置每個小方塊得 10 分
        LINE_BASE: 100,     // 消除一行得 100 分
        COMBO_BONUS: 0.5    // 同時消除多行時的加成倍率
    },
    GAME_STATE: { MENU: 0, GAME: 1, OVER: 2 },
    NEED_CLEAR_RATIO: 0.25, // 當前空格比例超過此值則不要求必須消除
    // Grid Settings
    DELTA_Y: 50,

    // Score Display Settings
    SCORE_SPACE: 1.8,
    MAX_DIGITS: 8,
};

export const SHAPES = [
    { name: 'Dot', coords: [[0,0]], difficulty: 1 },
    { name: 'Slash', coords: [[0,0], [1,-1], [-1,1]], difficulty: 2 },
    { name: 'Back-Slash', coords: [[0,0], [0,1], [0,-1]], difficulty: 2 },
    { name: 'Line', coords: [[0,0], [1,0], [-1,0]], difficulty: 2 },
    { name: 'Small-Triangle', coords: [[0,0], [0,-1], [-1,0]], difficulty: 2 },
    { name: 'Small-Triangle-Reversed', coords: [[0,0], [-1,1], [-1,0]], difficulty: 2 },
    { name: 'Crystal', coords: [[0,0], [-1,1], [0,-1], [-1,0]], difficulty: 2 },
    { name: 'Long-Line', coords: [[0,0], [1,0], [2,0], [-1,0]], difficulty: 3 },
    { name: 'Hourglass', coords: [[0,0], [-1,1], [0,-1], [1,-1], [0,1]], difficulty: 3 },
    { name: 'Big-V', coords: [[-1,0], [0,0], [1,0], [-1,1], [-1,2]], difficulty: 4 },
    { name: 'Big-V-Reversed', coords: [[-1,0], [0,0], [1,0], [1,-1], [1,-2]], difficulty: 4 },
    { name: 'Fan', coords: [[0,0], [-1,1], [0,-1], [1,0]], difficulty: 4 },
    { name: 'Y-Shape', coords: [[0,0], [0,-1], [1,0], [-1,1]], difficulty: 4 },
    { name: 'Hook', coords: [[0,0], [1,0], [0,1], [-1,2]], difficulty: 4 },
    { name: 'Snake', coords: [[0,0], [1,0], [1,-1], [2,-1]], difficulty: 4 },
    { name: 'Hex', coords: [[0,0], [-1,1], [-1,0], [0,-1], [1,0], [1,-1], [0,1]], difficulty: 5 },
    { name: 'Big-Triangle', coords: [[0,0], [1,0], [2,0], [0,1], [1,1], [0,2]], difficulty: 5 },
];