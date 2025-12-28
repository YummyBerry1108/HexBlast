import { CONFIG } from './constants.js'

export class UIManager {
    constructor() {
        this.startMenu = document.getElementById('start-menu');
        this.settingsMenu = document.getElementById('settings-menu')
        this.gameoverMenu = document.getElementById('gameover-menu')
        this.screens = {
            MENU: 'menu',
            SETTINGS: 'settings',
            GAME: 'game',
            GAMEOVER: 'gameover'
        };
    }

    /**
     * 切換顯示螢幕
     * @param {string} screenName 
     */
    changeScreen(screenName) {

        if (screenName === this.screens.GAME) {
            this.onStartGame();
        }
        else if (screenName === this.screens.SETTINGS) {
            this.settingsMenu.style.display = 'flex'
        }
        else if (screenName === this.screens.MENU) {
            this.settingsMenu.style.display = 'none'
            this.gameoverMenu.style.display = 'none'
            this.startMenu.style.display = 'flex'
            setTimeout(() => this.startMenu.style.opacity = "1", 10);
            CONFIG.MUSIC_VOLUME = document.getElementById('bgm-volume').value;
            CONFIG.SFX_VOLUME = document.getElementById('sfx-volume').value;
        }
        else if (screenName === this.screens.GAMEOVER) {
            this.gameoverMenu.style.display = 'flex'
            document.getElementById('high-score').innerText = localStorage.getItem('hex-high-score')
            setTimeout(() => this.gameoverMenu.style.opacity = "1", 10);
        }


        // this.startMenu.setAttribute('data-current-screen', screenName);
    }

    onStartGame() {
        this.startMenu.style.opacity = '0';
        setTimeout(() => {
            this.startMenu.style.display = 'none';
        }, 500);
    }

    animateScore(targetScore) {
    const scoreElement = document.getElementById('final-score');
    let currentDisplay = 0;
    const duration = 1500; // 跑 1.5 秒
    const startTime = performance.now();

    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用 Ease Out 效果讓結尾慢下來
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentDisplay = Math.floor(easeOut * targetScore);
        
        scoreElement.innerText = currentDisplay.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}
}

