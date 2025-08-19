// assets.js - Görsel asset yönetimi

// Sprite atlas sınıflarını içe aktar
import SpriteAtlas, { EnemyAtlas } from './sprite-atlas.js';

// Oyuncu ve düşman balık görselleri için preloader
class FishAssets {
    constructor() {
        // Sprite atlas yönetimi
        this.playerAtlas = new SpriteAtlas();
        this.enemyAtlas = new EnemyAtlas();
        
        // Görsellerin yüklenme durumu
        this.loaded = false;
        this.loadedCount = 0;
        this.totalImages = 2; // Player ve Enemy atlas'ları için
    }
    
    // Tüm görselleri yükle
    loadAllImages(callback) {
        // Oyuncu sprite atlas'larını yükle
        this.playerAtlas.loadAtlases(() => {
            this.onImageLoad(callback);
        });
        
        // Düşman sprite atlas'larını yükle
        this.enemyAtlas.loadAtlases(() => {
            this.onImageLoad(callback);
        });
    }
    
    // Görsel yüklendiğinde
    onImageLoad(callback) {
        this.loadedCount++;
        if (this.loadedCount === this.totalImages) {
            this.loaded = true;
            if (callback) callback();
        }
    }
    
    // Yüklenme durumunu kontrol et
    isLoaded() {
        return this.loaded;
    }
    
    // Oyuncu balık görseli çiz
    drawPlayerFish(ctx, x, y, size, level, direction, timestamp) {
        this.playerAtlas.updateFrame(timestamp);
        this.playerAtlas.drawFrame(ctx, x, y, size, level, direction);
    }
    
    // Düşman balık görseli çiz
    drawEnemyFish(ctx, x, y, size, level, direction, timestamp) {
        this.enemyAtlas.updateFrame(timestamp);
        this.enemyAtlas.drawFrame(ctx, x, y, size, level, direction);
    }
}

export default FishAssets;
