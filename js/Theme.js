// js/Theme.js
export const Theme = {
    current: 'lava', // 目前主題名稱
    colors: {
        neon: {
            bg: '#1a1a1a',
            grid: '#2a2a2a',
            displayActive: '#00FF99',
            displayIdle: '#222222',
            border: '#333333'
        },
        lava: {
            bg: '#1a0500',
            grid: '#331100',
            displayActive: '#FF4400',
            displayIdle: '#220000',
            border: '#441100'
        },
        cyberSynth: {
            bg: '#120422',
            grid: '#241139',
            displayActive: '#FF00FF',
            displayIdle: '#2A0A3D',
            border: '#333333'
        },
        deepOcean: {
            bg: '#001219',
            grid: '#00222E',
            displayActive: '#00E5FF',
            displayIdle: '#00313D',
            border: '#444444'
        },
        forestSpirit: {
            bg: '#0B1305',
            grid: '#1C2A12',
            displayActive: '#A7C957',
            displayIdle: '#1A2410',
            border: '#333333'
        },
        royalGold: {
            bg: '#0F0F0F',
            grid: '#1C1C1C',
            displayActive: '#D4AF37',
            displayIdle: '#252010',
            border: '#444444'
        },
        iceWhite: {
            bg: '#121212',
            grid: '#1E1E1E',
            displayActive: '#FFFFFF',
            displayIdle: '#252525',
            border: '#444444'
        },
        bloodMoon: {
            bg: '#1A0505',
            grid: '#2A0D0D',
            displayActive: '#FF3333',
            displayIdle: '#3D0A0A',
            border: '#444444'
        },
    },

    get(key) {
        return this.colors[this.current][key];
    },

    setTheme(name) {
        if (this.colors[name]) this.current = name;
    },

    nextTheme() {
        const themeNames = Object.keys(this.colors);
        const currentIndex = themeNames.indexOf(this.current);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        this.current = themeNames[nextIndex];
    }
};