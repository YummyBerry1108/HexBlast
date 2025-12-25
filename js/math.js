import { CONFIG } from './constants.js';

export function hexRound(fracQ, fracR) {
    let q = Math.round(fracQ);
    let r = Math.round(fracR);
    let s = Math.round(-fracQ - fracR);
    // ... 原有的 hexRound 邏輯
    return { q, r };
}

export function pixelToHex(px, py, centerX, centerY) {
    const currX = px - centerX;
    const currY = py - centerY;
    const q = (Math.sqrt(3)/3 * currX - 1/3 * currY) / CONFIG.HEX_SIZE;
    const r = (2/3 * currY) / CONFIG.HEX_SIZE;
    return hexRound(q, r);
}

export function hexToPixel(q, r, centerX, centerY) {
    const x = CONFIG.HEX_SIZE * Math.sqrt(3) * (q + r / 2) + centerX;
    const y = CONFIG.HEX_SIZE * 3 / 2 * r + centerY;
    return { x, y };
}