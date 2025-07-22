// config.js - Oyun yapılandırma ve sabitler

// Oyun sabitleri
const GAME_CONFIG = {
    // Oyuncu başlangıç değerleri
    PLAYER_INITIAL: {
        SIZE: 30,
        SPEED: 5,
        COLOR: '#FF6B6B',
        LEVEL: 1
    },
    
    // XP ve seviye
    XP_GROWTH_RATE: 1.5,
    BASE_XP_REQUIRED: 100,
    
    // Kamera
    ZOOM_DECREMENT: 0.15,
    MIN_ZOOM: 0.3,
    ZOOM_LEVEL_INTERVAL: 5,
    
    // Düşman balıklar
    ENEMY_BASE_SIZE: 20,
    ENEMY_SIZE_PER_LEVEL: 8,
    ENEMY_SPAWN_BASE_RATE: 0.02,
    ENEMY_SPAWN_RATE_PER_LEVEL: 0.003,
    
    // Balık nefes alma animasyonu - Basit ve etkili
    FISH_BREATHING_AMPLITUDE: 0.12, // Temel boyutun %12'si kadar salınım (daha belirgin)
    FISH_BREATHING_SPEED: 0.04,     // Yavaş ve doğal nefes alma

    // Balık renkleri
    FISH_COLORS: [
        '#87CEEB', // Level 1 - Açık mavi
        '#32CD32', // Level 2 - Yeşil
        '#FFD700', // Level 3 - Altın
        '#FF6347', // Level 4 - Domates kırmızısı
        '#9932CC', // Level 5 - Mor
        '#FF1493', // Level 6 - Pembe
        '#00CED1', // Level 7 - Turkuaz
        '#FF8C00', // Level 8 - Turuncu
        '#DC143C', // Level 9 - Kırmızı
        '#8B008B'  // Level 10+ - Koyu mor
    ],
    
    // Efektler
    PARTICLE_COUNT: 12,
    PARTICLE_SPEED: 12,
    PARTICLE_LIFE_DECREMENT: 0.02,
    
    // Oyun verisi kayıt anahtarı
    STORAGE_KEY: 'advancedFishGame'
};

// Dışa aktarma
export default GAME_CONFIG;
