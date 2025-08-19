// Sprite atlas yönetimi için sınıf
export class EnemyAtlas {
    constructor() {
        this.atlasImages = new Map(); // Her düşman tipi için atlas resmi
        this.currentFrame = 0; // Mevcut animasyon karesi
        this.frameCount = 8; // 512x512'lik atlas'ta sadece ilk 8 kare kullanılacak (4x2 grid)
        this.frameSize = 128; // Her karenin boyutu
        this.atlasSize = 512; // Atlas'ın toplam boyutu
        this.frameUpdateInterval = 100; // Her kare arası ms cinsinden süre
        this.lastFrameUpdate = 0;
        
        // Grid pozisyonları (sadece dolu kareler)
        this.validFrames = [
            {x: 0, y: 0}, // 1. kare
            {x: 1, y: 0}, // 2. kare
            {x: 2, y: 0}, // 3. kare
            {x: 3, y: 0}, // 4. kare
            {x: 0, y: 1}, // 5. kare
            {x: 1, y: 1}, // 6. kare
            {x: 2, y: 1}, // 7. kare
            {x: 3, y: 1}  // 8. kare
        ];
    }

    // Atlas resimlerini yükle
    loadAtlases(callback) {
        let loadedCount = 0;
        const totalImages = 16; // ObjectAnimSheet/Enemy klasöründeki toplam resim sayısı

        for (let level = 1; level <= totalImages; level++) {
            const img = new Image();
            const levelStr = level.toString().padStart(3, '0');
            img.src = `assets/images/ObjectAnimSheet/Enemy/${levelStr}.png`;
            
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages && callback) {
                    callback();
                }
            };

            img.onerror = () => {
                console.error(`Failed to load atlas for level ${level}`);
                loadedCount++;
                if (loadedCount === totalImages && callback) {
                    callback();
                }
            };

            this.atlasImages.set(level, img);
        }
    }

    // Belirli bir seviye için atlas resmini al
    getAtlasForLevel(level) {
        // Mevcut en yüksek seviyeye kadar sınırla
        const maxLevel = Math.min(level, this.atlasImages.size);
        return this.atlasImages.get(maxLevel);
    }

    // Animasyon karesini güncelle
    updateFrame(timestamp) {
        if (timestamp - this.lastFrameUpdate >= this.frameUpdateInterval) {
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            this.lastFrameUpdate = timestamp;
        }
    }

    // Mevcut kareyi çiz
    drawFrame(ctx, x, y, size, level, direction = 1) {
        const atlas = this.getAtlasForLevel(level);
        if (!atlas || !atlas.complete) return;

        // Geçerli frame pozisyonunu al
        const frame = this.validFrames[this.currentFrame];
        const gridX = frame.x * this.frameSize;
        const gridY = frame.y * this.frameSize;

        ctx.save();
        ctx.translate(x, y);
        
        // Yön için çevirme
        if (direction < 0) {
            ctx.scale(-1, 1);
        }

        // Gölge efekti
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Atlas'tan kareyi çiz
        ctx.drawImage(
            atlas,
            gridX, gridY, // Kaynak pozisyonu
            this.frameSize, this.frameSize, // Kaynak boyutu
            -size, -size, // Hedef pozisyonu (merkez etrafında)
            size * 2, size * 2 // Hedef boyutu
        );

        ctx.restore();
    }
}

// Player atlas sınıfı
export default class SpriteAtlas {
    constructor() {
        this.atlasImages = new Map(); // Her seviye için atlas resmi
        this.currentFrame = 0; // Mevcut animasyon karesi
        this.frameCount = 8; // 512x512'lik atlas'ta sadece ilk 8 kare kullanılacak (4x2 grid)
        this.frameSize = 128; // Her karenin boyutu
        this.atlasSize = 512; // Atlas'ın toplam boyutu
        this.frameUpdateInterval = 100; // Her kare arası ms cinsinden süre
        this.lastFrameUpdate = 0;
        
        // Grid pozisyonları (sadece dolu kareler)
        this.validFrames = [
            {x: 0, y: 0}, // 1. kare
            {x: 1, y: 0}, // 2. kare
            {x: 2, y: 0}, // 3. kare
            {x: 3, y: 0}, // 4. kare
            {x: 0, y: 1}, // 5. kare
            {x: 1, y: 1}, // 6. kare
            {x: 2, y: 1}, // 7. kare
            {x: 3, y: 1}  // 8. kare
        ];
    }

    // Atlas resimlerini yükle
    loadAtlases(callback) {
        let loadedCount = 0;
        const totalImages = 14; // ObjectAnimSheet/Player klasöründeki toplam resim sayısı

        for (let level = 1; level <= totalImages; level++) {
            const img = new Image();
            const levelStr = level.toString().padStart(3, '0');
            img.src = `assets/images/ObjectAnimSheet/Player/${levelStr}.png`;
            
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages && callback) {
                    callback();
                }
            };

            img.onerror = () => {
                console.error(`Failed to load atlas for level ${level}`);
                loadedCount++;
                if (loadedCount === totalImages && callback) {
                    callback();
                }
            };

            this.atlasImages.set(level, img);
        }
    }

    // Belirli bir seviye için atlas resmini al
    getAtlasForLevel(level) {
        // Mevcut en yüksek seviyeye kadar sınırla
        const maxLevel = Math.min(level, this.atlasImages.size);
        return this.atlasImages.get(maxLevel);
    }

    // Animasyon karesini güncelle
    updateFrame(timestamp) {
        if (timestamp - this.lastFrameUpdate >= this.frameUpdateInterval) {
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            this.lastFrameUpdate = timestamp;
        }
    }

    // Mevcut kareyi çiz
    drawFrame(ctx, x, y, size, level, direction = 1) {
        const atlas = this.getAtlasForLevel(level);
        if (!atlas || !atlas.complete) return;

        // Geçerli frame pozisyonunu al
        const frame = this.validFrames[this.currentFrame];
        const gridX = frame.x * this.frameSize;
        const gridY = frame.y * this.frameSize;

        ctx.save();
        ctx.translate(x, y);
        
        // Yön için çevirme
        if (direction < 0) {
            ctx.scale(-1, 1);
        }

        // Gölge efekti
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Atlas'tan kareyi çiz
        ctx.drawImage(
            atlas,
            gridX, gridY, // Kaynak pozisyonu
            this.frameSize, this.frameSize, // Kaynak boyutu
            -size, -size, // Hedef pozisyonu (merkez etrafında)
            size * 2, size * 2 // Hedef boyutu
        );

        ctx.restore();
    }
} 