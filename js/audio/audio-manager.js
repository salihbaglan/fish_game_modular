// audio-manager.js - Ses yönetim sistemi

export default class AudioManager {
    constructor() {
        this.sounds = {};
        this.isEnabled = true;
        this.masterVolume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        
        // Ses dosyalarını yükle
        this.loadSounds();
    }

    // Ses dosyalarını yükle
    loadSounds() {
        const soundFiles = {
            // Müzik
            gameLoop: {
                path: 'assets/audio/play/loop/loop_1.ogg',
                loop: true,
                volume: this.musicVolume,
                type: 'music'
            },
            dangerMusic: {
                path: 'assets/audio/play/sequance/seq_1.ogg',
                loop: true,
                volume: this.musicVolume,
                type: 'music'
            },
            
            // Ses efektleri
            eatFish: {
                path: 'assets/audio/game/eat_fish.ogg',
                loop: false,
                volume: this.sfxVolume,
                type: 'sfx'
            },
            hooked: {
                path: 'assets/audio/game/hooked.ogg',
                loop: false,
                volume: this.sfxVolume,
                type: 'sfx'
            },
            itemCollect: {
                path: 'assets/audio/game/item_collect.ogg',
                loop: false,
                volume: this.sfxVolume,
                type: 'sfx'
            },

            // UI Sesleri
            gameOver: {
                path: 'assets/audio/ui/gameover.ogg',
                loop: false,
                volume: this.sfxVolume,
                type: 'sfx'
            },
            switchToggle: {
                path: 'assets/audio/ui/switch_togele.ogg',
                loop: false,
                volume: this.sfxVolume * 0.7, // Biraz daha sessiz
                type: 'sfx'
            },
            levelUp: {
                path: 'assets/audio/ui/level_up.ogg',
                loop: false,
                volume: this.sfxVolume * 0.9,
                type: 'sfx'
            },
            upgradeButton: {
                path: 'assets/audio/ui/upgrade_btn.ogg',
                loop: false,
                volume: this.sfxVolume * 0.8,
                type: 'sfx'
            }
        };

        // Her ses dosyasını yükle
        Object.keys(soundFiles).forEach(key => {
            const soundConfig = soundFiles[key];
            const audio = new Audio(soundConfig.path);
            
            audio.loop = soundConfig.loop;
            audio.volume = soundConfig.volume * this.masterVolume;
            audio.preload = 'auto';
            
            // Ses yükleme hatalarını yakala
            audio.addEventListener('error', (e) => {
                console.warn(`Ses dosyası yüklenemedi: ${soundConfig.path}`, e);
            });
            
            this.sounds[key] = {
                audio: audio,
                config: soundConfig,
                isPlaying: false
            };
        });
    }

    // Ses çal
    play(soundName, volume = 1.0) {
        if (!this.isEnabled) return;

        const sound = this.sounds[soundName];
        if (!sound) {
            console.warn(`Ses bulunamadı: ${soundName}`);
            return;
        }

        try {
            const audio = sound.audio;

            // Ses efektleri için yeni bir Audio instance oluştur (çakışmayı önlemek için)
            if (sound.config.type === 'sfx') {
                const newAudio = new Audio(sound.config.path);
                newAudio.volume = sound.config.volume * volume * this.masterVolume;
                newAudio.preload = 'auto';

                const playPromise = newAudio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        // Sessizce geç, çok fazla log spam'i önlemek için
                        if (error.name !== 'AbortError') {
                            console.warn(`Ses çalınamadı: ${soundName}`, error);
                        }
                    });
                }
                return;
            }

            // Müzik için orijinal audio elementini kullan
            audio.currentTime = 0;
            audio.volume = sound.config.volume * volume * this.masterVolume;

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    sound.isPlaying = true;
                }).catch(error => {
                    if (error.name !== 'AbortError') {
                        console.warn(`Ses çalınamadı: ${soundName}`, error);
                    }
                });
            }
        } catch (error) {
            console.warn(`Ses çalma hatası: ${soundName}`, error);
        }
    }

    // Ses durdur
    stop(soundName) {
        const sound = this.sounds[soundName];
        if (!sound) return;

        try {
            sound.audio.pause();
            sound.audio.currentTime = 0;
            sound.isPlaying = false;
        } catch (error) {
            console.warn(`Ses durdurma hatası: ${soundName}`, error);
        }
    }

    // Tüm sesleri durdur
    stopAll() {
        Object.keys(this.sounds).forEach(soundName => {
            this.stop(soundName);
        });
    }

    // Müzik çal (önceki müziği durdur)
    playMusic(musicName) {
        // Önceki müziği durdur
        Object.keys(this.sounds).forEach(key => {
            const sound = this.sounds[key];
            if (sound.config.type === 'music' && sound.isPlaying) {
                this.stop(key);
            }
        });

        // Yeni müziği çal
        this.play(musicName);
    }

    // Ses açık/kapalı
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.stopAll();
        }
    }

    // Master volume ayarla
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        // Tüm seslerin volume'ünü güncelle
        Object.keys(this.sounds).forEach(key => {
            const sound = this.sounds[key];
            sound.audio.volume = sound.config.volume * this.masterVolume;
        });
    }

    // Müzik volume ayarla
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        Object.keys(this.sounds).forEach(key => {
            const sound = this.sounds[key];
            if (sound.config.type === 'music') {
                sound.config.volume = this.musicVolume;
                sound.audio.volume = this.musicVolume * this.masterVolume;
            }
        });
    }

    // SFX volume ayarla
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        
        Object.keys(this.sounds).forEach(key => {
            const sound = this.sounds[key];
            if (sound.config.type === 'sfx') {
                sound.config.volume = this.sfxVolume;
                sound.audio.volume = this.sfxVolume * this.masterVolume;
            }
        });
    }

    // Tehlike durumu kontrolü
    checkDangerState(game) {
        try {
            const dangerousElements = [
                ...(game.bombs || []),
                ...(game.hooks || []),
                ...(game.garbageClouds || [])
            ];

            const hasJellyfish = (game.enemies || []).some(enemy => enemy.type === 'jellyfish');
            const isDangerous = dangerousElements.length > 0 || hasJellyfish;

            // Müzik değiştir
            if (isDangerous && !this.sounds.dangerMusic?.isPlaying) {
                this.playMusic('dangerMusic');
            } else if (!isDangerous && !this.sounds.gameLoop?.isPlaying) {
                this.playMusic('gameLoop');
            }
        } catch (error) {
            console.warn('Tehlike durumu kontrolü hatası:', error);
        }
    }
}
