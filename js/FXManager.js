import { CONFIG } from './constants.js';

export class FXManager {
    constructor() {
        this.particles = [];
        this.shakeTime = 0;
        this.shakeIntensity = 0;
    }

    /**
     * 在特定位置產生爆炸粒子
     */
    createExplosion(x, y, color, life = 1.0, prelife = 0, particleCount = 8) {
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: life,
                prelife: prelife,
                color: color,
                size: Math.random() * 5 + 5
            });
        }
    }

    /**
     * 觸發畫面震動
     */
    triggerShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTime = duration;
    }

    update() {
        // 更新粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (p.prelife > 0) {
                p.prelife -= 1/CONFIG.FPS;
                continue;
            }
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 1/CONFIG.FPS;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // 更新震動時間
        if (this.shakeTime > 0) this.shakeTime--;
    }
}