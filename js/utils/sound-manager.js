// sound-manager.js - Ses yönetimi modülü

export default class SoundManager {
    constructor() {
        // Ses tercihleri (localStorage'dan oku)
        this.sfxEnabled = localStorage.getItem('sfxEnabled') !== 'false';
        this.musicEnabled = localStorage.getItem('musicEnabled') !== 'false';

        // Ses dosyaları tanımları
        this.sounds = {
            button1: new Audio('assets/Sounds/Button_1.wav'),
            button2: new Audio('assets/Sounds/Button_2.wav'),
            button3: new Audio('assets/Sounds/Button_3.wav'),
            collectCoin: new Audio('assets/Sounds/Collect_Coin.wav'),
            collectItem: new Audio('assets/Sounds/Collect_Item.wav'),
        };

        // Arka plan müziği (ayrı yönetim)
        this.music = new Audio('assets/Sounds/Main_Soundtrack.wav');
        this.music.loop = true;
        this.musicBaseVolume = 0.4;
        this.music.volume = this.musicBaseVolume;

        // Fade interval takibi
        this.fadeInterval = null;

        // SFX ses seviyesi
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.6;
        });
    }

    /**
     * Bir ses efekti çal (clone ile overlap desteği)
     */
    playSFX(name) {
        if (!this.sfxEnabled) return;

        const sound = this.sounds[name];
        if (!sound) {
            console.warn(`Sound not found: ${name}`);
            return;
        }

        // Aynı anda birden fazla çalabilmek için klonla
        const clone = sound.cloneNode();
        clone.volume = sound.volume;
        clone.play().catch(() => {
            // Autoplay policy hatalarını sessizce yakala
        });
    }

    /**
     * Arka plan müziğini başlat
     */
    playMusic() {
        if (!this.musicEnabled) return;

        // Aktif fade varsa iptal et
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }

        // Ses seviyesini geri yükle ve başlat
        this.music.volume = this.musicBaseVolume;
        this.music.currentTime = 0;
        this.music.play().catch(() => {
            // Autoplay policy - kullanıcı etkileşimi sonrası tekrar denenecek
        });
    }

    /**
     * Arka plan müziğini durdur
     */
    stopMusic() {
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }
        this.music.pause();
        this.music.currentTime = 0;
        this.music.volume = this.musicBaseVolume;
    }

    /**
     * Müziği fade-out ile durdur
     */
    fadeOutMusic(duration = 1000) {
        // Önceki fade'i iptal et
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
        }

        const startVolume = this.musicBaseVolume;
        const steps = 20;
        const stepTime = duration / steps;
        const volumeStep = startVolume / steps;
        let currentStep = 0;

        this.fadeInterval = setInterval(() => {
            currentStep++;
            this.music.volume = Math.max(0, startVolume - (volumeStep * currentStep));

            if (currentStep >= steps) {
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
                this.music.pause();
                this.music.currentTime = 0;
                this.music.volume = this.musicBaseVolume;
            }
        }, stepTime);
    }

    /**
     * SFX açma/kapama
     */
    setSFXEnabled(enabled) {
        this.sfxEnabled = enabled;
        localStorage.setItem('sfxEnabled', enabled);
    }

    /**
     * Müzik açma/kapama
     */
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        localStorage.setItem('musicEnabled', enabled);

        if (enabled) {
            this.music.play().catch(() => { });
        } else {
            this.music.pause();
        }
    }

    /**
     * SFX durumunu al
     */
    isSFXEnabled() {
        return this.sfxEnabled;
    }

    /**
     * Müzik durumunu al
     */
    isMusicEnabled() {
        return this.musicEnabled;
    }
}
