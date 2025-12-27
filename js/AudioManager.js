export class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
    }

    /**
     * 預載入音效
     * @param {Object} soundMap - { name: url }
     */
    async loadSounds(soundMap) {
        for (const [name, url] of Object.entries(soundMap)) {
            const audio = new Audio(url);
            audio.preload = 'auto';
            this.sounds[name] = audio;
        }
    }

    /**
     * 播放音效
     * @param {string} name 
     */
    play(name) {
        if (!this.enabled || !this.sounds[name]) return;

        const sound = this.sounds[name].cloneNode();
        sound.volume = 0.5;
        sound.play().catch(e => console.warn("Audio play blocked by browser."));
    }

    toggle(state) {
        this.enabled = state !== undefined ? state : !this.enabled;
    }

    playBGM(name) {
        if (!this.enabled || !this.sounds[name]) return;
        if (this.bgm) {
            this.bgm.pause();
        }
        this.bgm = this.sounds[name];
        this.bgm.loop = true;
        this.bgm.volume = 0.3;
        this.bgm.play().catch(e => console.warn("BGM play blocked by browser."));
    }
}