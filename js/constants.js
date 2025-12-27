export const CONFIG = {
    FPS: 60,
    HEX_SIZE: 35,
    DEFAULT_RADIUS: 5,
    COLORS: ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#9B59B6'],
    SCORE: {
        PER_TILE: 10,       // 放置每個小方塊得 10 分
        LINE_BASE: 100,     // 消除一行得 100 分
        COMBO_BONUS: 0.5    // 同時消除多行時的加成倍率
    },
    GAME_STATE: { MENU: 0, GAME: 1, OVER: 2 },
    // Grid Settings
    DELTA_Y: 50,

    // Score Display Settings
    SCORE_SPACE: 1.8,
    MAX_DIGITS: 8,
    FOREGROUND_COLOR: '#d00000',
    BACKGROUND_COLOR: '#430000'
};

export const SHAPES = [
    { name: 'Slash', coords: [[0,0], [1,-1], [-1,1]] },
    { name: 'Back-Slash', coords: [[0,0], [0,1], [0,-1]] },
    { name: 'Line', coords: [[0,0], [1,0], [-1,0]] },
    { name: 'Small-Triangle', coords: [[0,0], [0,-1], [-1,0]] },
    { name: 'Small-Triangle-Reversed', coords: [[0,0], [-1,1], [-1,0]] },
    { name: 'Hex', coords: [[0,0], [-1,1], [-1,0], [0,-1], [1,0], [1,-1], [0,1]] },
    { name: 'Hourglass', coords: [[0,0], [-1,1], [0,-1], [1,-1], [0,1]] },
    { name: 'Fan', coords: [[0,0], [-1,1], [0,-1], [1,0]] },
    { name: 'Crystal', coords: [[0,0], [-1,1], [0,-1], [-1,0]] },
];