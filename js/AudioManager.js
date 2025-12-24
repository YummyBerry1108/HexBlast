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
        
        // 複製一份以支援連續快速播放
        const sound = this.sounds[name].cloneNode();
        sound.volume = 0.5;
        sound.play().catch(e => console.warn("Audio play blocked by browser."));
    }

    toggle(state) {
        this.enabled = state !== undefined ? state : !this.enabled;
    }
}