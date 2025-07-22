// renderer.js - Çizim ve görsel işlemler

import { getFishColor } from '../utils/utils.js';
import FishAssets from '../utils/assets.js';

export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.assetsLoaded = false;
        this.fishAssets = new FishAssets(); // FishAssets sınıfını başlat
        
        // Arka plan görseli yükle
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'assets/images/Bg.png';
        this.backgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.backgroundLoaded = true;
            this.checkAllAssetsLoaded();
        };
        
        // Deniz anası görseli yükle
        this.jellyfishImage = new Image();
        this.jellyfishImage.src = 'assets/images/ocemom.png';
        this.jellyfishLoaded = false;
        this.jellyfishImage.onload = () => {
            this.jellyfishLoaded = true;
            this.checkAllAssetsLoaded();
        };
        
        // Bomba görseli yükle
        this.bombImage = new Image();
        this.bombImage.src = 'assets/images/Bomb.png';
        this.bombLoaded = false;
        this.bombImage.onload = () => {
            this.bombLoaded = true;
            this.checkAllAssetsLoaded();
        };
        
        // Baloncuk görseli yükle
        this.bubbleImage = new Image();
        this.bubbleImage.src = 'assets/images/Buble.png';
        this.bubbleLoaded = false;
        this.bubbleImage.onload = () => {
            this.bubbleLoaded = true;
            this.checkAllAssetsLoaded();
        };
        
        // Kanca görseli yükle
        this.hookImage = new Image();
        this.hookImage.src = 'assets/images/kanca.png';
        this.hookLoaded = false;
        this.hookImage.onload = () => {
            this.hookLoaded = true;
            this.checkAllAssetsLoaded();
        };
        
        // Mıknatıs görseli yükle
        this.magnetImage = new Image();
        this.magnetImage.src = 'assets/images/magnet.png';
        this.magnetLoaded = false;
        this.magnetImage.onload = () => {
            this.magnetLoaded = true;
            this.checkAllAssetsLoaded();
        };
        
        // Çöp görsellerini yükle
        this.garbageImages = [];
        this.garbageLoaded = 0;
        for (let i = 1; i <= 6; i++) {
            const img = new Image();
            img.src = `assets/images/garbage/${i}.png`;
            img.onload = () => {
                this.garbageLoaded++;
                if (this.garbageLoaded === 6) {
                    this.checkAllAssetsLoaded();
                }
            };
            this.garbageImages.push(img);
        }
        
        // Kalkan görseli yükle (Buble.png kullan)
        this.shieldImage = new Image();
        this.shieldImage.src = 'assets/images/Buble.png';
        this.shieldLoaded = false;
        this.shieldImage.onload = () => {
            this.shieldLoaded = true;
            this.checkAllAssetsLoaded();
        };
        
        // Görselleri yükle
        this.fishAssets.loadAllImages(() => {
            console.log('All fish assets loaded');
            this.assetsLoaded = true;
        });
    }

    // Check if all assets are loaded
    checkAllAssetsLoaded() {
        if (this.backgroundLoaded && 
            this.jellyfishLoaded && 
            this.bombLoaded && 
            this.bubbleLoaded && 
            this.hookLoaded && 
            this.magnetLoaded && 
            this.shieldLoaded && 
            this.garbageLoaded === 6 && 
            this.assetsLoaded) {
            
            // All assets are loaded, game can start
            console.log('All game assets loaded successfully');
            // You might want to trigger a callback or event here
            if (this.onAssetsLoaded) {
                this.onAssetsLoaded();
            }
        }
    }

    // Canvas boyutlarını ayarla
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Ekranı temizle
    clearScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Arka plan çiz (flip edilmiş tile sistemi)
    drawBackground() {
        if (!this.backgroundLoaded) return;
        
        const bgWidth = this.backgroundImage.width;
        const bgHeight = this.backgroundImage.height;
        
        // Ekran yüksekliğine göre ölçekle
        const scale = this.canvas.height / bgHeight;
        const scaledWidth = bgWidth * scale;
        
        // Kaç tane görsel gerektiğini hesapla
        const tilesNeeded = Math.ceil(this.canvas.width / scaledWidth) + 2;
        const startX = -scaledWidth;
        
        for (let i = 0; i < tilesNeeded; i++) {
            const x = startX + i * scaledWidth;
            
            this.ctx.save();
            
            // Ortadaki tile'ı normal çiz (i === 1 genellikle ortada olur)
            // Diğerlerini flip et
            if (i % 2 === 0) {
                // Çift indeksli tile'ları flip et
                this.ctx.translate(x + scaledWidth, 0);
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(this.backgroundImage, 0, 0, scaledWidth, this.canvas.height);
            } else {
                // Tek indeksli tile'ları normal çiz
                this.ctx.drawImage(this.backgroundImage, x, 0, scaledWidth, this.canvas.height);
            }
            
            this.ctx.restore();
        }
    }

    // Deniz anası çizme fonksiyonu
    drawJellyfish(x, y, size, color, cameraZoom = 1, pulsePhase = 0, direction = 1) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(cameraZoom, cameraZoom);
        
        // Gölge efekti
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        // Yön flip'i
        if (direction < 0) {
            this.ctx.scale(-1, 1);
        }
        
        // Nabız efekti
        const pulseScale = 1 + Math.sin(pulsePhase) * 0.1;
        this.ctx.scale(pulseScale, pulseScale);
        
        if (this.jellyfishLoaded && this.jellyfishImage.complete) {
            // Sadece görsel çiz, renklendirme yok
            const jellyfishSize = size * 1.8; // Biraz büyüt
            this.ctx.globalAlpha = 1;
            this.ctx.drawImage(
                this.jellyfishImage,
                -jellyfishSize/2,
                -jellyfishSize/2,
                jellyfishSize,
                jellyfishSize
            );
        } else {
            // Fallback: Vektörel çizim
            const bodyRadiusX = Math.abs(size * 0.4);
            const bodyRadiusY = Math.abs(size * 0.25);
            
            if (bodyRadiusX > 0 && bodyRadiusY > 0) {
                this.ctx.fillStyle = color;
                this.ctx.globalAlpha = 0.7;
                this.ctx.beginPath();
                this.ctx.ellipse(0, -size * 0.1, bodyRadiusX, bodyRadiusY, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Tentaküller
                this.ctx.globalAlpha = 0.6;
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 2;
                this.ctx.lineCap = 'round';
                
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    const startX = Math.cos(angle) * size * 0.2;
                    const startY = size * 0.1;
                    const endX = Math.cos(angle) * size * 0.15;
                    const endY = size * 0.4 + Math.sin(pulsePhase + i) * 3;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(startX, startY);
                    this.ctx.lineTo(endX, endY);
                    this.ctx.stroke();
                }
            }
        }
        
        // Shadow'u temizle
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.globalAlpha = 1;
        
        this.ctx.restore();
    }

    // Bomba çizme fonksiyonu
    drawBomb(bomb, cameraZoom = 1) {
        this.ctx.save();
        this.ctx.translate(bomb.x, bomb.y);
        this.ctx.scale(cameraZoom, cameraZoom);
        
        // Gölge efekti
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        
        // Rotasyon
        this.ctx.rotate(bomb.rotation);
        
        // Yanıp sönme efekti (yerdeyken)
        if (bomb.state === 'grounded' && bomb.blinking) {
            this.ctx.globalAlpha = 0.5;
        }
        
        if (this.bombLoaded && this.bombImage.complete) {
            // Bomba görselini çiz
            const bombSize = bomb.size * 1.5;
            this.ctx.drawImage(
                this.bombImage,
                -bombSize/2,
                -bombSize/2,
                bombSize,
                bombSize
            );
        } else {
            // Fallback: Vektörel bomba
            this.ctx.fillStyle = '#333';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, bomb.size/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Fitil
            this.ctx.strokeStyle = '#8B4513';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -bomb.size/2);
            this.ctx.lineTo(0, -bomb.size);
            this.ctx.stroke();
            
            // Fitil ucu (alev)
            this.ctx.fillStyle = '#FF4500';
            this.ctx.beginPath();
            this.ctx.arc(0, -bomb.size, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Shadow'u temizle
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.globalAlpha = 1;
        
        this.ctx.restore();
    }

    // Bomba uyarı çizimi
    drawBombWarning(warning, cameraZoom = 1) {
        this.ctx.save();
        
        // Pulse efekti
        const pulseAlpha = 0.3 + Math.sin(warning.pulsePhase) * 0.2;
        const pulseWidth = warning.width + Math.sin(warning.pulsePhase * 1.5) * 10;
        
        // Kırmızı uyarı şeridi
        this.ctx.fillStyle = `rgba(255, 0, 0, ${pulseAlpha})`;
        this.ctx.fillRect(
            warning.x - pulseWidth/2,
            warning.y,
            pulseWidth,
            warning.height
        );
        
        // Kenarlık
        this.ctx.strokeStyle = `rgba(255, 100, 100, ${pulseAlpha + 0.3})`;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            warning.x - pulseWidth/2,
            warning.y,
            pulseWidth,
            warning.height
        );
        
        // Üst kısımda uyarı metni
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('⚠️ BOMBA!', warning.x, 30);
        
        this.ctx.restore();
    }

    // Bomba glow efekti çizimi
    drawBombGlow(bomb, cameraZoom = 1) {
        this.ctx.save();
        
        // Glow animasyonu
        const glowScale = 1 + Math.sin(bomb.glowPhase) * 0.3;
        const glowRadius = bomb.glowRadius * glowScale * cameraZoom;
        const glowAlpha = 0.3 + Math.sin(bomb.glowPhase * 1.2) * 0.2;
        
        // Kırmızı glow gradient
        const gradient = this.ctx.createRadialGradient(
            bomb.x, bomb.y, glowRadius * 0.3,
            bomb.x, bomb.y, glowRadius
        );
        gradient.addColorStop(0, `rgba(255, 0, 0, ${glowAlpha})`);
        gradient.addColorStop(0.7, `rgba(255, 50, 50, ${glowAlpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        // Glow çemberi çiz
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(bomb.x, bomb.y, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // İç boş çember (daha belirgin glow)
        this.ctx.strokeStyle = `rgba(255, 0, 0, ${glowAlpha + 0.2})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(bomb.x, bomb.y, glowRadius * 0.8, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    // Kanca çizme fonksiyonu
    drawHook(hook, cameraZoom = 1) {
        this.ctx.save();
        
        // Kanca ipi çiz
        this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)'; // Kahverengi ip
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(hook.x, -50);
        this.ctx.lineTo(hook.x, hook.y);
        this.ctx.stroke();
        
        // Kanca gövdesi
        this.ctx.translate(hook.x, hook.y);
        this.ctx.scale(cameraZoom, cameraZoom);
        
        // Gölge efekti
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        if (this.hookLoaded && this.hookImage.complete) {
            // Kanca görselini çiz
            const hookSize = hook.size * 1.2;
            this.ctx.drawImage(
                this.hookImage,
                -hookSize/2,
                -hookSize/2,
                hookSize,
                hookSize
            );
        } else {
            // Fallback: Vektörel kanca
            this.ctx.strokeStyle = '#666';
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            
            // Kanca şekli
            this.ctx.beginPath();
            this.ctx.arc(0, 0, hook.size/3, Math.PI, Math.PI * 2);
            this.ctx.moveTo(-hook.size/3, 0);
            this.ctx.lineTo(-hook.size/2, hook.size/4);
            this.ctx.stroke();
        }
        
        // Solucan çiz (kanca ucunda)
        const wormOffset = Math.sin(hook.wormPhase) * 3;
        this.ctx.fillStyle = 'rgba(255, 100, 100, 0.9)'; // Kırmızımsı solucan
        this.ctx.beginPath();
        this.ctx.ellipse(
            -hook.size/3 + wormOffset,
            hook.size/4,
            4,
            8,
            hook.wormPhase * 0.1,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Solucan detayları
        this.ctx.fillStyle = 'rgba(200, 50, 50, 0.7)';
        for (let i = 0; i < 3; i++) {
            const segmentY = hook.size/4 - 4 + i * 3;
            this.ctx.beginPath();
            this.ctx.arc(-hook.size/3 + wormOffset, segmentY, 1, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Shadow'u temizle
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        this.ctx.restore();
    }

    // Mıknatıs çizme fonksiyonu
    drawMagnet(magnet, cameraZoom = 1) {
        this.ctx.save();
        this.ctx.translate(magnet.x, magnet.y);
        this.ctx.scale(cameraZoom, cameraZoom);
        this.ctx.rotate(magnet.rotation);
        
        // Sarı glow efekti (bomba gibi)
        const glowRadius = 50 + Math.sin(magnet.glowPhase) * 10;
        const glowAlpha = 0.3 + Math.sin(magnet.glowPhase) * 0.2;
        
        // Glow gradient
        const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        glowGradient.addColorStop(0, `rgba(255, 255, 0, ${glowAlpha})`);
        glowGradient.addColorStop(0.7, `rgba(255, 255, 0, ${glowAlpha * 0.5})`);
        glowGradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
        
        // Glow çiz
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Dış çizgi (sarı)
        this.ctx.strokeStyle = `rgba(255, 255, 0, ${0.8 + Math.sin(magnet.glowPhase) * 0.2})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, magnet.size + 5, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Gölge efekti
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        if (this.magnetLoaded && this.magnetImage.complete) {
            // Mıknatıs görselini çiz
            const magnetSize = magnet.size * 1.5;
            this.ctx.drawImage(
                this.magnetImage,
                -magnetSize/2,
                -magnetSize/2,
                magnetSize,
                magnetSize
            );
        } else {
            // Fallback: Vektörel mıknatıs
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(-magnet.size/2, -magnet.size/3, magnet.size/2, magnet.size * 2/3);
            this.ctx.fillStyle = '#0000FF';
            this.ctx.fillRect(0, -magnet.size/3, magnet.size/2, magnet.size * 2/3);
            
            // Orta çizgi
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -magnet.size/3);
            this.ctx.lineTo(0, magnet.size/3);
            this.ctx.stroke();
        }
        
        // Shadow'u temizle
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        this.ctx.restore();
    }

    // Mıknatıs çekim dairesi çizme
    drawMagnetField(player, magnetEffect, cameraZoom = 1) {
        if (!magnetEffect.active) return;
        
        this.ctx.save();
        this.ctx.translate(player.x, player.y);
        this.ctx.scale(cameraZoom, cameraZoom);
        
        const magnetRange = 150;
        const time = Date.now() * 0.003; // Dalga animasyonu için zaman
        
        // Dalgalı çizgi için birden fazla daire çiz
        for (let i = 0; i < 3; i++) {
            const waveOffset = Math.sin(time + i * 0.5) * 8; // Dalga efekti
            const currentRadius = magnetRange + waveOffset - i * 3;
            const alpha = 0.4 - i * 0.1; // Her daire biraz daha şeffaf
            
            // Glow efekti
            const glowGradient = this.ctx.createRadialGradient(
                0, 0, currentRadius - 15,
                0, 0, currentRadius + 15
            );
            glowGradient.addColorStop(0, 'rgba(255, 255, 0, 0)');
            glowGradient.addColorStop(0.5, `rgba(255, 255, 0, ${alpha * 0.3})`);
            glowGradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
            
            // Glow çiz
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, currentRadius + 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Dalgalı çizgi çiz
            this.ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
            this.ctx.lineWidth = 2 + i;
            this.ctx.setLineDash([10, 5]); // Kesikli çizgi
            this.ctx.lineDashOffset = time * 20; // Hareket eden kesikli çizgi
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // İçe doğru küçülen dalgalar
        for (let i = 0; i < 5; i++) {
            const waveTime = time * 2 + i * 0.8;
            const waveRadius = magnetRange * (0.3 + 0.6 * Math.abs(Math.sin(waveTime)));
            const waveAlpha = 0.3 * Math.abs(Math.sin(waveTime));
            
            this.ctx.strokeStyle = `rgba(255, 255, 100, ${waveAlpha})`;
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 10]);
            this.ctx.lineDashOffset = waveTime * 15;
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Çizgi stilini sıfırla
        this.ctx.setLineDash([]);
        this.ctx.restore();
    }

    // Çöp bulutu çizme fonksiyonu
    drawGarbageCloud(cloud, cameraZoom = 1) {
        this.ctx.save();
        this.ctx.translate(cloud.x, cloud.y);
        this.ctx.scale(cameraZoom, cameraZoom);
        
        // Gaz bulutu efekti
        const gasAlpha = 0.4 + Math.sin(cloud.gasPhase) * 0.1;
        const baseRadius = cloud.size;
        
        // Basit daire şekli
        this.ctx.beginPath();
        this.ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
        
        // Gaz bulutu gradient
        const gasGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius * 1.2);
        gasGradient.addColorStop(0, `rgba(120, 120, 120, ${gasAlpha * 0.8})`);
        gasGradient.addColorStop(0.4, `rgba(100, 100, 100, ${gasAlpha * 0.6})`);
        gasGradient.addColorStop(0.7, `rgba(80, 80, 80, ${gasAlpha * 0.3})`);
        gasGradient.addColorStop(1, `rgba(60, 60, 60, 0)`);
        
        // Bulut dolgusunu çiz
        this.ctx.fillStyle = gasGradient;
        this.ctx.fill();
        
        // Dış çizgi (zehirli gaz efekti)
        this.ctx.strokeStyle = `rgba(100, 150, 100, ${gasAlpha * 0.8})`;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([8, 4]);
        this.ctx.lineDashOffset = cloud.gasPhase * 15;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Çöp parçalarını çiz
        cloud.garbageItems.forEach(item => {
            this.ctx.save();
            this.ctx.translate(item.offsetX, item.offsetY);
            this.ctx.rotate(item.rotation);
            
            // Yer çekimsiz yüzen efekt için hafif gölge
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 3;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;
            
            if (this.garbageLoaded === 6 && this.garbageImages[item.type - 1].complete) {
                // Çöp görselini çiz
                this.ctx.drawImage(
                    this.garbageImages[item.type - 1],
                    -item.size/2,
                    -item.size/2,
                    item.size,
                    item.size
                );
            } else {
                // Fallback: Basit çöp şekli
                this.ctx.fillStyle = '#8B4513'; // Kahverengi
                this.ctx.fillRect(-item.size/2, -item.size/2, item.size, item.size);
                
                // Çöp detayı
                this.ctx.fillStyle = '#654321';
                this.ctx.fillRect(-item.size/4, -item.size/4, item.size/2, item.size/2);
            }
            
            // Shadow'u temizle
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            this.ctx.restore();
        });
        
        this.ctx.restore();
    }

    // Kalkan çizme fonksiyonu
    drawShield(shield, cameraZoom = 1) {
        this.ctx.save();
        this.ctx.translate(shield.x, shield.y);
        this.ctx.scale(cameraZoom, cameraZoom);
        this.ctx.rotate(shield.rotation);
        
        // Glow efekti
        const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, shield.size + 15);
        glowGradient.addColorStop(0, `rgba(0, 150, 255, ${0.6 + Math.sin(shield.glowPhase) * 0.3})`);
        glowGradient.addColorStop(0.7, `rgba(0, 100, 255, ${0.3 + Math.sin(shield.glowPhase) * 0.2})`);
        glowGradient.addColorStop(1, 'rgba(0, 150, 255, 0)');
        
        // Glow çiz
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, shield.size + 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Dış çizgi (mavi glow)
        this.ctx.strokeStyle = `rgba(0, 150, 255, ${0.8 + Math.sin(shield.glowPhase) * 0.2})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, shield.size + 5, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Gölge efekti
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        if (this.shieldLoaded && this.shieldImage.complete) {
            // Kalkan görselini çiz (Buble.png)
            const shieldSize = shield.size * 1.5;
            this.ctx.drawImage(
                this.shieldImage,
                -shieldSize/2,
                -shieldSize/2,
                shieldSize,
                shieldSize
            );
        } else {
            // Fallback: Vektörel kalkan
            this.ctx.fillStyle = 'rgba(0, 150, 255, 0.7)';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, shield.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // İç çizgi
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, shield.size * 0.7, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Shadow'u temizle
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        this.ctx.restore();
    }

    // Player etrafında kalkan efekti çizme
    drawPlayerShield(player, shieldEffect, cameraZoom = 1) {
        if (!shieldEffect.active) return;
        
        this.ctx.save();
        this.ctx.translate(player.x, player.y);
        this.ctx.scale(cameraZoom, cameraZoom);
        
        const shieldRadius = player.size * 1.2; // Player boyutunun 1.2 katı
        const alpha = 0.3 + Math.sin(Date.now() * 0.005) * 0.2; // Fade efekti
        
        // Kalkan bulutu gradient
        const shieldGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, shieldRadius);
        shieldGradient.addColorStop(0, `rgba(0, 150, 255, ${alpha * 0.3})`);
        shieldGradient.addColorStop(0.7, `rgba(0, 100, 255, ${alpha * 0.5})`);
        shieldGradient.addColorStop(1, `rgba(0, 150, 255, 0)`);
        
        // Kalkan bulutu çiz
        this.ctx.fillStyle = shieldGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Dış çizgi
        this.ctx.strokeStyle = `rgba(0, 150, 255, ${alpha})`;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.lineDashOffset = Date.now() * 0.01;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        this.ctx.restore();
    }

    // Balık çizme fonksiyonu (görsel veya vektörel)
    drawFish(x, y, size, color, direction = 1, fishLevel = 1, cameraZoom = 1, isPlayer = false, enemyType = 0, rotation = 0, timestamp) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(cameraZoom, cameraZoom);
        
        // Takılmış balık rotasyonu
        if (rotation) {
            this.ctx.rotate(rotation);
        }
        
        if (isPlayer) {
            // Oyuncu balığı için sprite atlas kullan
            this.fishAssets.drawPlayerFish(this.ctx, 0, 0, size, fishLevel, direction, timestamp);
        } else {
            // Düşman balıkları için yeni atlas sistemini kullan
            this.fishAssets.drawEnemyFish(this.ctx, 0, 0, size, fishLevel, direction, timestamp);
        }
        
        this.ctx.restore();
    }

    // Vektörel balık çizimi (fallback için)
    drawVectorFish(size, color, direction, fishLevel) {
        this.ctx.save();
        
        // Gölge efekti ekle
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        this.ctx.shadowBlur = 6;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        if (direction < 0) this.ctx.scale(-1, 1);
        
        // Gövde (seviyeye göre parlaklık)
        const alpha = Math.min(1, 0.7 + fishLevel * 0.03);
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Kuyruk
        this.ctx.beginPath();
        this.ctx.moveTo(-size, 0);
        this.ctx.lineTo(-size * 1.5, -size * 0.3);
        this.ctx.lineTo(-size * 1.3, 0);
        this.ctx.lineTo(-size * 1.5, size * 0.3);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.globalAlpha = 1;
        
        // Göz (beyaz kısım)
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.ellipse(size * 0.3, -size * 0.2, size * 0.15, size * 0.15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Göz (siyah kısım)
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.ellipse(size * 0.35, -size * 0.2, size * 0.08, size * 0.08, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Seviye yüksekse crown efekti
        if (fishLevel >= 8) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.moveTo(-size * 0.2, -size * 0.8);
            this.ctx.lineTo(-size * 0.1, -size * 1.2);
            this.ctx.lineTo(0, -size * 0.9);
            this.ctx.lineTo(size * 0.1, -size * 1.2);
            this.ctx.lineTo(size * 0.2, -size * 0.8);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    // MMORPG stilinde balık seviye göstergesi
    drawFishLevelIndicator(fish, cameraZoom) {
        this.ctx.save();
        
        const fontSize = Math.max(10, 14 * cameraZoom);
        const text = `Lv.${fish.level}`;
        const x = fish.x;
        const y = fish.y - fish.size - 15;
        
        // Arka plan kutusu
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        const textMetrics = this.ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        
        const padding = 4;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = textHeight + padding * 2;
        const boxX = x - boxWidth / 2;
        const boxY = y - textHeight - padding;
        
        // Arka plan gradient
        const gradient = this.ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
        if (fish.canEat) {
            gradient.addColorStop(0, 'rgba(0, 100, 0, 0.9)');
            gradient.addColorStop(1, 'rgba(0, 150, 0, 0.9)');
        } else {
            gradient.addColorStop(0, 'rgba(150, 0, 0, 0.9)');
            gradient.addColorStop(1, 'rgba(200, 0, 0, 0.9)');
        }
        
        // Kutu çiz
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Kutu kenarlığı
        this.ctx.strokeStyle = fish.canEat ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, 1)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // İç gölge efekti
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(boxX + 1, boxY + 1, boxWidth - 2, boxHeight - 2);
        
        // Yazı gölgesi
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillText(text, x + 1, y + 1);
        
        // Ana yazı
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(text, x, y);
        
        // Yazı parıltısı
        this.ctx.fillStyle = fish.canEat ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 100, 100, 0.5)';
        this.ctx.fillText(text, x, y - 1);
        
        this.ctx.restore();
    }

    // Parçacık çizimi
    drawParticle(particle, cameraZoom) {
        this.ctx.save();
        
        if (particle.type === 'bubble') {
            // Baloncuk çizimi (Buble.png ile)
            this.ctx.globalAlpha = particle.alpha * particle.life;
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);
            
            if (this.bubbleLoaded && this.bubbleImage.complete) {
                const size = particle.size * cameraZoom;
                this.ctx.drawImage(
                    this.bubbleImage,
                    -size/2,
                    -size/2,
                    size,
                    size
                );
            } else {
                // Fallback: Basit daire baloncuk
                this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, particle.size/2 * cameraZoom, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        } else {
            // Normal parçacık çizimi
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            const size = (particle.size || 4) * cameraZoom;
            
            // Daire şeklinde parçacık (daha güzel görünüm)
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, size/2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    // Tüm oyun nesnelerini çiz
    drawGame(player, enemies, particles, cameraZoom, mouseX, gameState) {
        this.clearScreen();
        
        // Arka planı çiz
        this.drawBackground();

        if (gameState !== 'playing') return;

        // Düşman balıkları çiz
        enemies.forEach(enemy => {
            if (enemy.type === 'jellyfish') {
                // Deniz anası çiz
                this.drawJellyfish(
                    enemy.x,
                    enemy.y,
                    enemy.size / cameraZoom,
                    enemy.color,
                    cameraZoom,
                    enemy.pulsePhase,
                    enemy.direction
                );
            } else {
                // Normal balık çiz
                const enemyType = (enemy.level % 4); // 0-3 arası
                
                this.drawFish(
                    enemy.x,
                    enemy.y,
                    enemy.size / cameraZoom,
                    enemy.color,
                    enemy.direction,
                    enemy.level,
                    cameraZoom,
                    false,
                    enemyType,
                    enemy.rotation || 0,
                    Date.now()
                );
                this.drawFishLevelIndicator(enemy, cameraZoom);
            }
        });

        // Mıknatıs çekim dairesi çiz (player'dan önce)
        if (gameState === 'playing' && window.game && window.game.magnetEffect) {
            this.drawMagnetField(player, window.game.magnetEffect, cameraZoom);
        }

        // Player kalkan efekti çiz (player'dan önce)
        if (gameState === 'playing' && window.game && window.game.shieldEffect) {
            this.drawPlayerShield(player, window.game.shieldEffect, cameraZoom);
        }

        // Oyuncu balığını çiz
        const direction = player.isHooked ? 0 : player.direction;
        this.drawFish(
            player.x,
            player.y,
            player.size / cameraZoom,
            player.color,
            direction,
            player.level,
            cameraZoom,
            true,
            0,
            player.rotation || 0,
            Date.now()
        );

        // Bomba uyarılarını çiz
        if (gameState === 'playing' && window.game && window.game.bombWarnings) {
            window.game.bombWarnings.forEach(warning => {
                this.drawBombWarning(warning, cameraZoom);
            });
        }
        
        // Kancaları çiz
        if (gameState === 'playing' && window.game && window.game.hooks) {
            window.game.hooks.forEach(hook => {
                this.drawHook(hook, cameraZoom);
            });
        }
        
        // Mıknatısları çiz
        if (gameState === 'playing' && window.game && window.game.magnets) {
            window.game.magnets.forEach(magnet => {
                this.drawMagnet(magnet, cameraZoom);
            });
        }
        
        // Kalkanları çiz
        if (gameState === 'playing' && window.game && window.game.shields) {
            window.game.shields.forEach(shield => {
                this.drawShield(shield, cameraZoom);
            });
        }
        
        // Çöp bulutlarını çiz
        if (gameState === 'playing' && window.game && window.game.garbageClouds) {
            window.game.garbageClouds.forEach(cloud => {
                this.drawGarbageCloud(cloud, cameraZoom);
            });
        }
        
        // Bombaları çiz (önce glow, sonra bomba)
        if (gameState === 'playing' && window.game && window.game.bombs) {
            window.game.bombs.forEach(bomb => {
                this.drawBombGlow(bomb, cameraZoom);
                this.drawBomb(bomb, cameraZoom);
            });
        }
        
        // Parçacıkları çiz
        particles.forEach(particle => {
            this.drawParticle(particle, cameraZoom);
        });
    }
}
