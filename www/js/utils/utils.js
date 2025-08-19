// utils.js - Yardımcı fonksiyonlar

import CONFIG from './config.js';

// Balık seviyesine göre renk belirleme
export function getFishColor(fishLevel) {
    return CONFIG.FISH_COLORS[Math.min(fishLevel - 1, CONFIG.FISH_COLORS.length - 1)];
}

// XP hesaplama fonksiyonu (Exponential growth)
export function calculateXPRequired(level) {
    return Math.floor(CONFIG.BASE_XP_REQUIRED * Math.pow(CONFIG.XP_GROWTH_RATE, level - 1));
}

// High score yükleme
export function loadHighScore() {
    try {
        const saved = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
        return saved.highScore || 0;
    } catch (e) {
        return 0;
    }
}

// Oyun verilerini kaydetme
export function saveGameData(highScore) {
    try {
        const gameData = {
            highScore: highScore
        };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(gameData));
    } catch (e) {
        // localStorage kullanılamıyor
        console.error('Veri kaydedilemedi:', e);
    }
}

// Çarpışma kontrolü
export function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.size + obj2.size) * 0.7;
}
