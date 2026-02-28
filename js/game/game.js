// game.js - Ana oyun mantığı

import CONFIG from '../utils/config.js';
import { getFishColor, calculateXPRequired, checkCollision } from '../utils/utils.js';
import FishAssets from '../utils/assets.js';

export default class Game {
    constructor(canvas, effects, ui) { // ui parametresini ekledik
        this.canvas = canvas;
        this.effects = effects;
        this.ui = ui; // ui referansını saklıyoruz
        this.fishAssets = new FishAssets();

        // Zaman yavaşlatma sistemi
        this.timeScale = 1;
        this.isSlowMotionActive = false;
        this.slowMotionTimer = 0;
        this.slowMotionDelay = 180; // 3 saniye (60 FPS)
        this.slowMotionScale = 0.2; // %20 hız
        this.isTouching = false; // Dokunma durumu için yeni değişken

        // XP bar takibi için
        this.xpBarPosition = { x: 0, y: 0 };
        this.lastFrameTime = 0;

        // Mouse/touch pozisyonu için yeni değişkenler
        this.lastMousePosition = { x: 0, y: 0 };
        this.isMouseDown = false;

        // resumeGame fonksiyonunu bağla
        this.resumeGame = this.resumeGame.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.updateXPBarPosition = this.updateXPBarPosition.bind(this);

        // Event listener'ları güncelle
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);

        // Dokunma olaylarını dinle
        document.addEventListener('touchstart', this.handleTouchStart);
        document.addEventListener('touchend', this.handleTouchEnd);
        document.addEventListener('mousedown', this.handleTouchStart);
        document.addEventListener('mouseup', this.handleTouchEnd);

        // Mouse/touch event listener'ları ekle
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('touchmove', this.handleTouchMove);

        // XP bar animasyonunu başlat
        requestAnimationFrame(this.updateXPBarPosition);

        // Oyun durumu
        this.gameState = 'start';
        this.score = 0;
        this.highScore = 0;
        this.playerLevel = 1;
        this.currentXP = 0;
        this.xpToNextLevel = CONFIG.BASE_XP_REQUIRED;
        this.cameraZoom = 1;
        this.fishCurrency = 0; // Yenen balık sayısı (para birimi)
        this.sessionEatenFish = 0; // Bu oturumda yenen balık sayısı

        // Yeni Dinamik Senaryo Sistemi
        this.gameTimer = 0; // Saniye cinsinden oyun süresi
        this.currentPhase = 'calm'; // calm, intense, chaos, bonus
        this.phaseTimer = 0; // Mevcut faz süresi
        this.phaseDuration = 600; // Her faz 10 saniye (60 FPS * 10)
        this.phaseIntensity = 1; // Faz yoğunluğu
        this.nextPhaseChange = 600; // Sonraki faz değişimi
        this.gameRhythm = 0; // Oyun ritmi (0-100)
        this.stressLevel = 0; // Stres seviyesi (0-100)
        this.relaxationBonus = 0; // Rahatlama bonusu

        // Oyun nesneleri
        this.player = this.createPlayer();
        this.enemies = [];
        this.particles = [];
        this.bubbleTimer = 0;
        this.bombs = [];
        this.bombWarnings = [];
        this.hooks = [];
        this.hookedFish = [];
        this.magnets = [];
        this.garbageClouds = [];
        this.shields = [];

        // Mıknatıs efekti
        this.magnetEffect = {
            active: false,
            duration: 0,
            maxDuration: 1800 // 30 saniye (60 FPS * 30)
        };

        // Kalkan efekti
        this.shieldEffect = {
            active: false,
            duration: 0,
            maxDuration: 1800 // 30 saniye (60 FPS * 30)
        };

        // Deniz anası efektleri
        this.playerSlowEffect = {
            active: false,
            duration: 0,
            originalSpeed: 0
        };
    }

    // Oyuncu balığı oluşturma
    createPlayer() {

        const player = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            size: CONFIG.PLAYER_INITIAL.SIZE,
            baseSize: CONFIG.PLAYER_INITIAL.SIZE,
            speed: CONFIG.PLAYER_INITIAL.SPEED,
            color: CONFIG.PLAYER_INITIAL.COLOR,
            level: CONFIG.PLAYER_INITIAL.LEVEL, // Atlas için seviye
            direction: 1, // Başlangıç yönü
            rotation: 0,
            isAnimating: true // Animasyon durumu
        };

        return player;
    }

    // Düşman balık oluşturma - Ekran dışından spawn
    createEnemyFish() {
        // Zoom seviyesine göre spawn mesafesini ayarla
        const spawnDistance = Math.max(150, 200 / this.cameraZoom);

        // Ekran dışından spawn (görünmez alanda)
        const spawnSide = Math.random();
        let x, y, direction;

        if (spawnSide < 0.25) { // Sol kenar - ekran dışından
            x = -spawnDistance; // Zoom'a göre ayarlanmış mesafe
            y = Math.random() * this.canvas.height;
            direction = 1; // Sağa doğru hareket
        } else if (spawnSide < 0.5) { // Sağ kenar - ekran dışından
            x = this.canvas.width + spawnDistance; // Zoom'a göre ayarlanmış mesafe
            y = Math.random() * this.canvas.height;
            direction = -1; // Sola doğru hareket
        } else if (spawnSide < 0.75) { // Üst kenar - ekran dışından
            x = Math.random() * this.canvas.width;
            y = -spawnDistance; // Zoom'a göre ayarlanmış mesafe
            direction = Math.random() < 0.5 ? 1 : -1;
        } else { // Alt kenar - ekran dışından
            x = Math.random() * this.canvas.width;
            y = this.canvas.height + spawnDistance; // Zoom'a göre ayarlanmış mesafe
            direction = Math.random() < 0.5 ? 1 : -1;
        }

        // Balık seviyesi belirleme (oyuncu seviyesine göre)
        const minLevel = Math.max(1, this.playerLevel - 2);
        const maxLevel = this.playerLevel + 3;
        const fishLevel = minLevel + Math.floor(Math.random() * (maxLevel - minLevel + 1));

        // Seviyeye göre boyut hesaplama
        const size = CONFIG.ENEMY_BASE_SIZE + fishLevel * CONFIG.ENEMY_SIZE_PER_LEVEL;

        const fish = {
            x: x,
            y: y,
            size: size,
            baseSize: size,
            speed: 1 + Math.random() * 2 + fishLevel * 0.1,
            direction: direction,
            color: getFishColor(fishLevel),
            level: fishLevel,
            canEat: fishLevel <= this.playerLevel,
            xpValue: fishLevel * 10 + Math.floor(Math.random() * fishLevel * 5),
            targetX: this.player.x + (Math.random() - 0.5) * 200, // Player yakınında hedef
            targetY: this.player.y + (Math.random() - 0.5) * 200
        };

        this.enemies.push(fish);
    }

    // Deniz anası oluşturma - Ekran dışından spawn
    createJellyfish() {
        // Zoom seviyesine göre spawn mesafesini ayarla
        const spawnDistance = Math.max(150, 200 / this.cameraZoom);

        // Ekran dışından spawn
        const spawnSide = Math.random();
        let x, y, direction;

        if (spawnSide < 0.5) { // Sol/sağ kenar - ekran dışından
            x = spawnSide < 0.25 ? -spawnDistance : this.canvas.width + spawnDistance;
            y = Math.random() * this.canvas.height;
            direction = spawnSide < 0.25 ? 1 : -1;
        } else { // Üst/alt kenar - ekran dışından
            x = Math.random() * this.canvas.width;
            y = spawnSide < 0.75 ? -spawnDistance : this.canvas.height + spawnDistance;
            direction = Math.random() < 0.5 ? 1 : -1;
        }

        const jellyfish = {
            x: x,
            y: y,
            size: 40 + Math.random() * 20,
            baseSize: 40 + Math.random() * 20,
            speed: 0.5 + Math.random() * 1,
            direction: direction,
            color: `hsl(${Math.random() * 60 + 280}, 70%, 60%)`, // Mor-pembe tonları
            type: 'jellyfish',
            level: 1,
            canEat: false, // Deniz anası yenilemez
            breathingCycle: Math.random() * Math.PI * 2,
            breathingAmplitude: 0.02, // Çok hafif nefes alma
            breathingSpeed: 0.01,
            pulsePhase: Math.random() * Math.PI * 2, // Nabız efekti için
            targetX: this.player.x + (Math.random() - 0.5) * 300,
            targetY: this.player.y + (Math.random() - 0.5) * 300
        };

        this.enemies.push(jellyfish);
    }

    // Bomba uyarı oluşturma - Canvas içinde
    createBombWarning() {
        const warningX = Math.random() * (this.canvas.width - 100) + 50;

        const warning = {
            x: warningX,
            y: 50, // Canvas üst kısmında görünür
            width: 80,
            height: this.canvas.height - 100,
            timer: 180, // 3 saniye (60 FPS) - daha hızlı
            maxTimer: 180,
            alpha: 0.9,
            pulsePhase: 0
        };

        this.bombWarnings.push(warning);

        // 3 saniye sonra bomba oluştur - daha hızlı
        setTimeout(() => {
            this.createBomb(warningX);
        }, 3000);
    }

    // Bomba oluşturma - Canvas içinde
    createBomb(x = null) {
        const bombX = x || (Math.random() * (this.canvas.width - 100) + 50);

        const bomb = {
            x: bombX,
            y: 50, // Canvas üst kısmından başla
            size: 30,
            speed: 3 + Math.random() * 2, // Daha hızlı
            type: 'bomb',
            state: 'falling', // falling, grounded, exploding
            groundTimer: 0,
            maxGroundTime: 120, // 2 saniye (60 FPS) - daha hızlı
            rotation: 0,
            rotationSpeed: 0.15, // Daha hızlı dönüş
            glowPhase: 0,
            glowRadius: 80, // Daha büyük uyarı
            visible: true // Hemen görünür
        };

        this.bombs.push(bomb);
    }

    // Kanca oluşturma - Canvas içinde
    createHook() {
        const hook = {
            x: Math.random() * (this.canvas.width - 200) + 100,
            y: 50, // Canvas üst kısmından başla
            targetY: Math.min(this.canvas.height - 100, 200 + Math.random() * 200), // Canvas içinde hedef
            speed: 2, // Daha hızlı
            state: 'descending', // descending, fishing, ascending
            fishingTimer: 0,
            maxFishingTime: 120, // 2 saniye balık avlama - daha hızlı
            driftSpeed: 0.5, // Daha belirgin hareket
            driftDirection: Math.random() < 0.5 ? -1 : 1,
            swayPhase: Math.random() * Math.PI * 2,
            wormPhase: Math.random() * Math.PI * 2,
            size: 30, // Daha büyük ve görünür
            lineLength: 0,
            visible: true, // Hemen görünür
            warningRadius: 100 // Uyarı alanı
        };

        this.hooks.push(hook);
    }

    // Mıknatıs oluşturma - Canvas içinde
    createMagnet() {
        const magnet = {
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: 50, // Canvas üst kısmından başla
            speed: 3 + Math.random() * 2, // Daha hızlı
            size: 35, // Daha büyük ve görünür
            rotation: 0,
            rotationSpeed: 0.08, // Daha hızlı dönüş
            glowPhase: Math.random() * Math.PI * 2,
            collected: false,
            visible: true, // Hemen görünür
            attractionRadius: 120 // Çekim alanı
        };

        this.magnets.push(magnet);
    }

    // Çöp bulutu oluşturma - Canvas içinde
    createGarbageCloud() {
        const cloud = {
            x: Math.random() * (this.canvas.width - 200) + 100,
            y: 50, // Canvas üst kısmından başla
            targetY: Math.min(this.canvas.height - 150, 150 + Math.random() * 200), // Canvas içinde hedef
            speed: 1.5 + Math.random() * 0.5, // Daha hızlı
            size: 120, // Daha büyük ve tehlikeli
            lifetime: 480 + Math.random() * 240, // 8-12 saniye - daha kısa
            age: 0,
            gasPhase: Math.random() * Math.PI * 2,
            garbageItems: [],
            visible: true, // Hemen görünür
            dangerRadius: 80 // Tehlike alanı
        };

        // Bulut içinde 8-12 çöp parçası oluştur
        const itemCount = 8 + Math.floor(Math.random() * 5);
        for (let i = 0; i < itemCount; i++) {
            const angle = (Math.PI * 2 * i) / itemCount + Math.random() * 0.5;
            const distance = 20 + Math.random() * 40;

            cloud.garbageItems.push({
                type: Math.floor(Math.random() * 6) + 1, // 1-6 arası çöp tipi
                offsetX: Math.cos(angle) * distance,
                offsetY: Math.sin(angle) * distance,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05,
                floatPhase: Math.random() * Math.PI * 2,
                floatSpeed: 0.02 + Math.random() * 0.02,
                size: 20 + Math.random() * 10 // Çöp boyutu (2 tık daha büyük)
            });
        }

        this.garbageClouds.push(cloud);
    }

    // Kalkan oluşturma
    createShield() {
        const shield = {
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: -50,
            speed: 2 + Math.random() * 2,
            size: 30,
            rotation: 0,
            rotationSpeed: 0.05,
            glowPhase: Math.random() * Math.PI * 2,
            collected: false
        };

        this.shields.push(shield);
    }

    // Balığı kancaya takma
    hookFish(fish, hook) {
        // Balığın ağzını kancaya hizalama
        const mouthToHookX = hook.x - fish.x;
        const mouthToHookY = hook.y - fish.y;
        const angle = Math.atan2(mouthToHookY, mouthToHookX);

        const hookedFish = {
            fish: fish,
            hook: hook,
            offsetX: -fish.size * 0.4, // Ağız kısmından takılma
            offsetY: 0,
            strugglePhase: 0,
            struggleIntensity: 0.5 + Math.random() * 0.5,
            originalDirection: fish.direction,
            targetRotation: angle - Math.PI, // Ağız kancaya bakacak şekilde
            currentRotation: fish.rotation || 0
        };

        // Balığı işaretle
        fish.direction = 0; // Hareket durduruluyor
        fish.isHooked = true; // Takılmış olarak işaretle

        this.hookedFish.push(hookedFish);

        // Balığı düşman listesinden ÇIKARMA - sadece işaretle
        // Bu sayede balık görünmeye devam eder
    }

    // Player'ı kancaya takma
    hookPlayer(hook) {
        // Player'ın ağzını kancaya hizalama
        const mouthToHookX = hook.x - this.player.x;
        const mouthToHookY = hook.y - this.player.y;
        const angle = Math.atan2(mouthToHookY, mouthToHookX);

        const hookedPlayer = {
            player: this.player,
            hook: hook,
            offsetX: -this.player.size * 0.4, // Ağız kısmından
            offsetY: 0,
            strugglePhase: 0,
            struggleIntensity: 0.8,
            isPlayer: true,
            targetRotation: angle - Math.PI, // Ağız kancaya bakacak şekilde
            currentRotation: this.player.rotation || 0
        };

        // Player'ı işaretle
        this.player.isHooked = true;

        this.hookedFish.push(hookedPlayer);

        // Kancayı hemen yukarı çekmeye başlat
        hook.state = 'ascending';
    }

    // Kanca-balık etkileşimi kontrolü
    checkHookFishInteraction(hook) {
        // Player kanca kontrolü
        const playerDistance = Math.sqrt(
            Math.pow(this.player.x - hook.x, 2) +
            Math.pow(this.player.y - hook.y, 2)
        );

        if (playerDistance < 35) {
            // Player kancaya takıldı - player'ı da kancaya tak
            this.hookPlayer(hook);

            // Takılma efekti
            const splashParticles = this.effects.createParticles(
                hook.x,
                hook.y,
                'rgba(255, 100, 100, 0.8)',
                12,
                6
            );
            this.particles.push(...splashParticles);
            return;
        }

        // Düşman balık kontrolü
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const fish = this.enemies[i];

            // Deniz anası kancaya takılmaz
            if (fish.type === 'jellyfish') continue;

            // Zaten takılmış balık kontrolü
            if (fish.isHooked) continue;

            // Mesafe kontrolü - kanca başına çarpma
            const distance = Math.sqrt(
                Math.pow(fish.x - hook.x, 2) +
                Math.pow(fish.y - hook.y, 2)
            );

            // Kanca başına çarptı mı? (daha büyük menzil)
            if (distance < 35) {
                // Direkt yakalama - kim çarparsa çarpsın
                this.hookFish(fish, hook);

                // Takılma efekti
                const splashParticles = this.effects.createParticles(
                    hook.x,
                    hook.y,
                    'rgba(100, 200, 255, 0.8)',
                    8,
                    4
                );
                this.particles.push(...splashParticles);

                break; // Bir balık takıldı, döngüyü kır
            }
        }
    }

    // Balık kanca kaçınma AI'sı
    applyHookAvoidance(fish) {
        for (const hook of this.hooks) {
            if (hook.state !== 'fishing') continue;

            const distance = Math.sqrt(
                Math.pow(fish.x - hook.x, 2) +
                Math.pow(fish.y - hook.y, 2)
            );

            // Kanca tehlike alanında mı? (100px)
            if (distance < 100) {
                // Kancadan kaçınma kuvveti
                const avoidanceStrength = (100 - distance) / 100;
                const avoidanceForce = avoidanceStrength * 2;

                // Kancadan uzaklaşma yönü
                const avoidX = (fish.x - hook.x) / distance;
                const avoidY = (fish.y - hook.y) / distance;

                // Balığın hareketini etkileme
                fish.x += avoidX * avoidanceForce;
                fish.y += avoidY * avoidanceForce;

                // Ekran sınırları kontrolü
                fish.x = Math.max(50, Math.min(this.canvas.width - 50, fish.x));
                fish.y = Math.max(50, Math.min(this.canvas.height - 50, fish.y));
            }
        }
    }

    // Mıknatıs efekti uygulama
    applyMagnetEffect() {
        const magnetRange = 150; // Mıknatıs menzili

        for (const enemy of this.enemies) {
            // Deniz anası mıknatıstan etkilenmez
            if (enemy.type === 'jellyfish') continue;

            // Takılmış balıklar etkilenmez
            if (enemy.isHooked) continue;

            // Player yiyebilir mi kontrolü
            if (!enemy.canEat) continue;

            const distance = Math.sqrt(
                Math.pow(enemy.x - this.player.x, 2) +
                Math.pow(enemy.y - this.player.y, 2)
            );

            // Mıknatıs menzilinde mi?
            if (distance < magnetRange && distance > 0) {
                // Player'a doğru çekme kuvveti (artırıldı)
                const pullStrength = (magnetRange - distance) / magnetRange * 6;
                const pullX = (this.player.x - enemy.x) / distance;
                const pullY = (this.player.y - enemy.y) / distance;

                // Balığı player'a doğru çek
                enemy.x += pullX * pullStrength;
                enemy.y += pullY * pullStrength;
            }
        }
    }

    // Bomba patlama
    explodeBomb(bomb, index) {
        const explosionRadius = 120; // Patlama çapı

        // Patlama çapındaki tüm balıkları kontrol et
        this.checkExplosionDamage(bomb.x, bomb.y, explosionRadius);

        // Gelişmiş patlama efektleri
        const explosionParticles = this.effects.createExplosionEffect(bomb.x, bomb.y);
        this.particles.push(...explosionParticles);

        // Su patlama efekti
        const waterParticles = this.effects.createWaterExplosionEffect(bomb.x, bomb.y, explosionRadius);
        this.particles.push(...waterParticles);

        // Baloncuk efekti (Buble.webp ile)
        const bubbleParticles = this.effects.createBubbleExplosionEffect(bomb.x, bomb.y);
        this.particles.push(...bubbleParticles);

        // Ekran sallama efekti
        this.effects.createScreenShake(15, 400);

        // Bombayı kaldır
        this.bombs.splice(index, 1);
    }

    // Patlama hasarı kontrolü
    checkExplosionDamage(explosionX, explosionY, radius) {
        // Oyuncu kontrolü
        const playerDistance = Math.sqrt(
            Math.pow(this.player.x - explosionX, 2) +
            Math.pow(this.player.y - explosionY, 2)
        );

        if (playerDistance <= radius) {
            this.gameOver();
            return;
        }

        // Düşman balıkları kontrolü
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const enemyDistance = Math.sqrt(
                Math.pow(enemy.x - explosionX, 2) +
                Math.pow(enemy.y - explosionY, 2)
            );

            if (enemyDistance <= radius) {
                // Düşman balığı öldür
                const deathParticles = this.effects.createParticles(
                    enemy.x,
                    enemy.y,
                    enemy.color,
                    8,
                    6
                );
                this.particles.push(...deathParticles);

                this.enemies.splice(i, 1);
            }
        }
    }

    // XP ekleme ve seviye kontrolü
    addXP(amount) {
        this.currentXP += amount;
        this.score += amount;

        if (this.currentXP >= this.xpToNextLevel) {
            this.currentXP -= this.xpToNextLevel;
            this.playerLevel++;

            // Oyuncu büyüme
            this.player.baseSize += 5;
            this.player.size = this.player.baseSize;

            // Oyuncu seviyesini güncelle (atlas için)
            this.player.level = this.playerLevel;

            // Yeni seviye için gerekli XP
            this.xpToNextLevel = calculateXPRequired(this.playerLevel);

            // Kamera zoom ayarı (her 5 seviyede bir zoom out)
            if (this.playerLevel % CONFIG.ZOOM_LEVEL_INTERVAL === 0) {
                this.cameraZoom = Math.max(CONFIG.MIN_ZOOM, this.cameraZoom - CONFIG.ZOOM_DECREMENT);
            }

            // Floating level göstergesini güncelle
            const floatingLevel = document.getElementById('floatingLevel');
            if (floatingLevel) {
                floatingLevel.textContent = this.playerLevel;

                // Level up animasyonu
                floatingLevel.style.transform = 'scale(1.5)';
                floatingLevel.style.transition = 'transform 0.2s ease';
                setTimeout(() => {
                    floatingLevel.style.transform = 'scale(1)';
                }, 200);
            }

            this.effects.showLevelUpPopup(this.playerLevel);
        }
    }

    // Oyun güncelleme
    update(mousePosition, deltaTime) {
        if (this.gameState !== 'playing') {
            this.timeScale = 1; // Game over durumunda normal hız
            return;
        }

        // Zaman yavaşlatma sistemi güncelleme
        if (!this.isSlowMotionActive && !this.player.isHooked && !this.isTouching) {
            this.slowMotionTimer++;
            if (this.slowMotionTimer >= this.slowMotionDelay) {
                this.isSlowMotionActive = true;
                this.timeScale = this.slowMotionScale;

                if (this.ui && typeof this.ui.showMessage === 'function') {
                    this.ui.showMessage('Devam etmek için dokun', 'info', 0, this.timeScale);
                }
            }
        }

        // Yavaşlatma modunda dokunma kontrolü
        if (this.isSlowMotionActive && this.isTouching) {
            this.timeScale = 1; // Dokunduğunda normal hız
        } else if (this.isSlowMotionActive && !this.isTouching) {
            this.timeScale = this.slowMotionScale; // Dokunmadığında yavaş
        }

        // deltaTime'ı timeScale ile ölçekle
        const scaledDeltaTime = deltaTime * this.timeScale;

        // Oyuncu hareketi - son mouse pozisyonunu kullan
        if (!this.player.isHooked && this.isTouching) {
            const TOUCH_OFFSET_Y = -80; // Parmağın altına girmemesi için offset
            const dx = this.lastMousePosition.x - this.player.x;
            const dy = (this.lastMousePosition.y + TOUCH_OFFSET_Y) - this.player.y;
            const baseSpeed = 0.1;
            const currentSpeed = this.playerSlowEffect.active ? baseSpeed * 0.3 : baseSpeed;

            // Hareket yönüne göre direction değerini ayarla
            if (Math.abs(dx) > 0.1) { // Küçük hareketleri görmezden gel
                this.player.direction = dx > 0 ? 1 : -1; // Sağa gidiyorsa sağa bak, sola gidiyorsa sola bak
            }

            this.player.x += dx * currentSpeed;
            this.player.y += dy * currentSpeed;

            // Oyuncuyu ekran sınırları içinde tut
            this.player.x = Math.max(this.player.size / 2, Math.min(this.canvas.width - this.player.size / 2, this.player.x));
            this.player.y = Math.max(this.player.size / 2, Math.min(this.canvas.height - this.player.size / 2, this.player.y));
        }

        // Oyuncu boyutunu sabit tut
        this.player.size = this.player.baseSize * this.cameraZoom;

        // Düşman balıkların güncellenmesi
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (!enemy.isHooked) {  // Kancaya takılı değilse hareket edebilir
                enemy.x += enemy.speed * enemy.direction * this.timeScale;

                if (enemy.type === 'jellyfish') {
                    enemy.pulsePhase += 0.05 * this.timeScale;
                }

                // Düşman balık boyutunu sabit tut
                enemy.size = enemy.baseSize;
            }

            // Ekrandan çıkan balıkları temizle
            if ((enemy.direction > 0 && enemy.x > this.canvas.width + 100) ||
                (enemy.direction < 0 && enemy.x < -100)) {
                this.enemies.splice(i, 1);
            }
        }

        // Bombaların güncellenmesi
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];
            bomb.glowPhase += 0.08 * this.timeScale;

            if (bomb.state === 'falling') {
                bomb.y += bomb.speed * this.timeScale;
                bomb.rotation += bomb.rotationSpeed * this.timeScale;
            } else if (bomb.state === 'grounded') {
                bomb.groundTimer += this.timeScale;
                bomb.rotation += bomb.rotationSpeed * 0.5 * this.timeScale;
            }
        }

        // Kancaların güncellenmesi
        for (let i = this.hooks.length - 1; i >= 0; i--) {
            const hook = this.hooks[i];
            hook.swayPhase += 0.05 * this.timeScale;
            hook.wormPhase += 0.15 * this.timeScale;

            if (hook.state === 'descending') {
                hook.y += hook.speed * this.timeScale;
                hook.x += Math.sin(hook.swayPhase) * 0.5 * this.timeScale;
            } else if (hook.state === 'fishing') {
                hook.fishingTimer += this.timeScale;
                hook.x += hook.driftDirection * hook.driftSpeed * this.timeScale;
                hook.y += Math.sin(hook.swayPhase) * 0.3 * this.timeScale;
            } else if (hook.state === 'ascending') {
                hook.y -= hook.speed * 1.5 * this.timeScale;
            }
        }

        // Takılmış balıkların güncellenmesi
        for (let i = this.hookedFish.length - 1; i >= 0; i--) {
            const hookedFish = this.hookedFish[i];
            hookedFish.strugglePhase += 0.2 * this.timeScale;
            const struggleX = Math.sin(hookedFish.strugglePhase) * hookedFish.struggleIntensity * 8;
            const struggleY = Math.cos(hookedFish.strugglePhase * 1.3) * hookedFish.struggleIntensity * 5;

            // Rotasyon animasyonu
            const rotationDiff = hookedFish.targetRotation - hookedFish.currentRotation;
            hookedFish.currentRotation += rotationDiff * 0.1 * this.timeScale;

            if (hookedFish.isPlayer) {
                this.player.rotation = hookedFish.currentRotation;
                const tailSwing = Math.sin(hookedFish.strugglePhase * 2) * hookedFish.struggleIntensity * 0.3;
                this.player.rotation += tailSwing;
                this.player.x = hookedFish.hook.x + hookedFish.offsetX + struggleX;
                this.player.y = hookedFish.hook.y + hookedFish.offsetY + struggleY;
            } else {
                const fish = hookedFish.fish;
                fish.rotation = hookedFish.currentRotation;
                const tailSwing = Math.sin(hookedFish.strugglePhase * 2) * hookedFish.struggleIntensity * 0.3;
                fish.rotation += tailSwing;
                fish.x = hookedFish.hook.x + hookedFish.offsetX + struggleX;
                fish.y = hookedFish.hook.y + hookedFish.offsetY + struggleY;
            }
        }

        // Çöp bulutlarının güncellenmesi
        for (let i = this.garbageClouds.length - 1; i >= 0; i--) {
            const cloud = this.garbageClouds[i];
            cloud.age += this.timeScale;
            cloud.gasPhase += 0.05 * this.timeScale;

            if (cloud.y < cloud.targetY) {
                cloud.y += cloud.speed * this.timeScale;
            }

            // Çöp parçalarını güncelle
            cloud.garbageItems.forEach(item => {
                item.floatPhase += item.floatSpeed * this.timeScale;
                item.rotation += item.rotationSpeed * this.timeScale;
                item.offsetX += Math.sin(item.floatPhase) * 0.3 * this.timeScale;
                item.offsetY += Math.cos(item.floatPhase * 1.3) * 0.2 * this.timeScale;
            });
        }

        // Mıknatısların güncellenmesi
        for (let i = this.magnets.length - 1; i >= 0; i--) {
            const magnet = this.magnets[i];
            magnet.y += magnet.speed * this.timeScale;
            magnet.rotation += magnet.rotationSpeed * this.timeScale;
            magnet.glowPhase += 0.08 * this.timeScale;
        }

        // Kalkanların güncellenmesi
        for (let i = this.shields.length - 1; i >= 0; i--) {
            const shield = this.shields[i];
            shield.y += shield.speed * this.timeScale;
            shield.rotation += shield.rotationSpeed * this.timeScale;
            shield.glowPhase += 0.08 * this.timeScale;
        }

        // Parçacıkların güncellenmesi
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx * this.timeScale;
            particle.y += particle.vy * this.timeScale;

            if (particle.type === 'bubble') {
                particle.life -= 0.008 * this.timeScale;
                particle.rotation += particle.rotationSpeed * this.timeScale;
                particle.vy *= Math.pow(0.995, this.timeScale);
                particle.vx *= Math.pow(0.98, this.timeScale);
            } else {
                particle.life -= CONFIG.PARTICLE_LIFE_DECREMENT * this.timeScale;
            }
        }

        // Efekt sürelerinin güncellenmesi
        if (this.magnetEffect.active) {
            this.magnetEffect.duration -= this.timeScale;
            if (this.magnetEffect.duration > 0) {
                this.applyMagnetEffect();
            } else {
                this.magnetEffect.active = false;
            }
        }

        if (this.shieldEffect.active) {
            this.shieldEffect.duration -= this.timeScale;
            if (this.shieldEffect.duration <= 0) {
                this.shieldEffect.active = false;
            }
        }

        if (this.playerSlowEffect.active) {
            this.playerSlowEffect.duration -= this.timeScale;
            if (this.playerSlowEffect.duration <= 0) {
                this.playerSlowEffect.active = false;
            }
        }

        // Diğer güncellemeler
        this.updateProgressiveSpawning();
        this.checkSurpriseEvents();
        this.checkCollisions();
    }

    // Oyun başlatma
    startGame() {
        // Oyun durumunu sıfırla
        this.gameState = 'playing';
        this.score = 0;
        this.playerLevel = 1;
        this.currentXP = 0;
        this.xpToNextLevel = CONFIG.BASE_XP_REQUIRED;
        this.cameraZoom = 1;
        this.fishCurrency = 0;
        this.sessionEatenFish = 0;

        // Zaman yavaşlatma sistemini sıfırla
        this.timeScale = 1;
        this.isSlowMotionActive = false;
        this.slowMotionTimer = 0;

        // Timer ve dalga sistemini sıfırla
        this.gameTimer = 0;
        this.currentWave = 1;
        this.waveTimer = 0;
        this.difficultyMultiplier = 1;
        this.nextSurpriseEvent = 600; // İlk sürpriz olay 10 saniye sonra
        this.calmPeriodEnd = null; // Sakin dönem sıfırla
        this.enemies = [];
        this.particles = [];
        this.bombs = [];
        this.bombWarnings = [];
        this.hooks = [];
        this.hookedFish = [];
        this.magnets = [];
        this.garbageClouds = [];
        this.shields = [];

        // Mıknatıs efektini sıfırla
        this.magnetEffect = {
            active: false,
            duration: 0,
            maxDuration: 1800 // 30 saniye
        };

        // Kalkan efektini sıfırla
        this.shieldEffect = {
            active: false,
            duration: 0,
            maxDuration: 1800 // 30 saniye
        };

        // Player'ı yeniden oluştur ve kanca durumunu temizle
        this.player = this.createPlayer();
        this.player.isHooked = false;
        this.player.rotation = 0;

        // Deniz anası efektlerini sıfırla
        this.playerSlowEffect = {
            active: false,
            duration: 0,
            originalSpeed: 0
        };

        // Dokunma durumunu sıfırla
        this.isTouching = false;

        // Seviye göstericisini güncelle
        const floatingLevel = document.getElementById('floatingLevel');
        if (floatingLevel) {
            floatingLevel.textContent = this.playerLevel;
            floatingLevel.style.transform = 'scale(1)';
        }
    }

    // Oyun bitişi
    gameOver() {
        this.gameState = 'gameOver';

        // Oyun hızını normale döndür
        this.timeScale = 1;
        this.isSlowMotionActive = false;
        this.isTouching = false;

        if (this.score > this.highScore) {
            this.highScore = this.score;
        }

        return {
            score: this.score,
            level: this.playerLevel,
            highScore: this.highScore
        };
    }

    // Oyun durumunu al
    getGameState() {
        return {
            gameState: this.gameState,
            score: this.score,
            highScore: this.highScore,
            playerLevel: this.playerLevel,
            currentXP: this.currentXP,
            xpToNextLevel: this.xpToNextLevel,
            cameraZoom: this.cameraZoom,
            player: this.player,
            enemies: this.enemies,
            particles: this.particles,
            magnetEffect: this.magnetEffect,
            shieldEffect: this.shieldEffect,
            fishCurrency: this.fishCurrency,
            sessionEatenFish: this.sessionEatenFish,
            gameTimer: this.gameTimer,
            currentWave: this.currentWave,
            waveTimer: this.waveTimer
        };
    }

    // Yeni dalga başlatma
    nextWave() {
        this.currentWave++;
        this.waveTimer = 0;
        this.difficultyMultiplier = 1 + (this.currentWave - 1) * 0.3; // Her dalga %30 daha zor

        // Dalga geçiş efekti
        const waveParticles = this.effects.createParticles(
            this.canvas.width / 2,
            this.canvas.height / 2,
            '#FFD700',
            20,
            10
        );
        this.particles.push(...waveParticles);


    }

    // Progresif spawn sistemi
    updateProgressiveSpawning() {
        const waveProgress = this.waveTimer / this.waveDuration; // 0-1 arası
        const gameMinutes = Math.floor(this.gameTimer / 3600); // Oyun dakikası

        // Sakin dönem kontrolü
        if (this.calmPeriodEnd && this.gameTimer < this.calmPeriodEnd) {
            return; // Sakin dönemde hiç spawn etme
        }

        // Dalga 1-2: Sadece küçük balıklar (kolay başlangıç)
        if (this.currentWave <= 2) {
            if (Math.random() < 0.015 * this.difficultyMultiplier) {

                this.createEnemyFish();
            }
            // Çok nadir mıknatıs
            if (Math.random() < 0.0005) {
                this.createMagnet();
            }
        }
        // Dalga 3-5: Deniz anaları eklenir
        else if (this.currentWave <= 5) {
            if (Math.random() < 0.02 * this.difficultyMultiplier) {
                this.createEnemyFish();
            }
            if (Math.random() < 0.001 * this.difficultyMultiplier) {
                this.createJellyfish();
            }
            if (Math.random() < 0.0008) {
                this.createMagnet();
            }
            if (Math.random() < 0.0006) {
                this.createShield();
            }
        }
        // Dalga 6-10: Kancalar eklenir
        else if (this.currentWave <= 10) {
            if (Math.random() < 0.025 * this.difficultyMultiplier) {
                this.createEnemyFish();
            }
            if (Math.random() < 0.002 * this.difficultyMultiplier) {
                this.createJellyfish();
            }
            if (Math.random() < 0.001 * this.difficultyMultiplier) {
                this.createHook();
            }
            if (Math.random() < 0.001) {
                this.createMagnet();
            }
            if (Math.random() < 0.0008) {
                this.createShield();
            }
        }
        // Dalga 11+: Tüm tehlikeler (bombalar ve çöp bulutları)
        else {
            if (Math.random() < 0.03 * this.difficultyMultiplier) {
                this.createEnemyFish();
            }
            if (Math.random() < 0.003 * this.difficultyMultiplier) {
                this.createJellyfish();
            }
            if (Math.random() < 0.002 * this.difficultyMultiplier) {
                this.createHook();
            }
            if (Math.random() < 0.001 * this.difficultyMultiplier) {
                this.createBombWarning();
            }
            if (Math.random() < 0.002 * this.difficultyMultiplier) {
                this.createGarbageCloud();
            }
            if (Math.random() < 0.0012) {
                this.createMagnet();
            }
            if (Math.random() < 0.001) {
                this.createShield();
            }
        }
    }

    // Sürpriz olaylar
    checkSurpriseEvents() {
        if (this.gameTimer >= this.nextSurpriseEvent) {
            this.triggerSurpriseEvent();
            this.nextSurpriseEvent = this.gameTimer + this.surpriseEventInterval;
        }
    }

    // Sürpriz olay tetikleme
    triggerSurpriseEvent() {
        const events = [
            'fishRain',      // Balık yağmuru (kolay balıklar)
            'magnetStorm',   // Mıknatıs fırtınası
            'jellyfishSwarm', // Deniz anası sürüsü
            'treasureTime',  // Hazine zamanı (çok mıknatıs/kalkan)
            'calmPeriod'     // Sakin dönem (hiç düşman yok)
        ];

        const eventType = events[Math.floor(Math.random() * events.length)];

        switch (eventType) {
            case 'fishRain':

                for (let i = 0; i < 8; i++) {
                    setTimeout(() => this.createEnemyFish(), i * 200);
                }
                break;

            case 'magnetStorm':

                for (let i = 0; i < 2; i++) { // 5'ten 2'ye düşürüldü
                    setTimeout(() => this.createMagnet(), i * 800);
                }
                break;

            case 'jellyfishSwarm':

                for (let i = 0; i < 3; i++) { // 4'ten 3'e düşürüldü
                    setTimeout(() => this.createJellyfish(), i * 600);
                }
                break;

            case 'treasureTime':

                for (let i = 0; i < 1; i++) { // 3'ten 1'e düşürüldü
                    setTimeout(() => {
                        this.createMagnet();
                        this.createShield();
                    }, i * 1000);
                }
                break;

            case 'calmPeriod':

                // 5 saniye boyunca hiç düşman spawn etmeme
                this.calmPeriodEnd = this.gameTimer + 300; // 5 saniye
                break;
        }

        // Sürpriz olay efekti
        const surpriseParticles = this.effects.createParticles(
            this.canvas.width / 2,
            50,
            '#FF69B4',
            15,
            8
        );
        this.particles.push(...surpriseParticles);
    }

    // Timer formatı (MM:SS)
    getFormattedTime() {
        const totalSeconds = Math.floor(this.gameTimer / 60); // 60 FPS
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Yavaşlatmadan çıkış fonksiyonu
    resumeGame() {
        if (this.isSlowMotionActive) {
            this.isSlowMotionActive = false;
            this.timeScale = 1;
            this.slowMotionTimer = 0;

            // Mesajı hemen gizle
            if (this.ui && typeof this.ui.hideMessage === 'function') {
                this.ui.hideMessage();
            }
        }
    }

    // Tüm çarpışma kontrollerini tek bir yerde yap
    checkCollisions() {
        // Bomba çarpışmaları
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];

            if (checkCollision(this.player, bomb)) {
                if (this.shieldEffect.active) continue;
                this.explodeBomb(bomb, i);
                this.gameOver();
                return;
            }

            // Yere çarpma kontrolü
            if (bomb.state === 'falling' && bomb.y >= this.canvas.height - 50) {
                bomb.state = 'grounded';
                bomb.y = this.canvas.height - 50;
                bomb.speed = 0;
                bomb.rotationSpeed = 0;
            }

            // Yerdeki bomba kontrolü
            if (bomb.state === 'grounded' && bomb.groundTimer >= bomb.maxGroundTime) {
                this.explodeBomb(bomb, i);
            }
        }

        // Çöp bulutu çarpışmaları
        for (let i = this.garbageClouds.length - 1; i >= 0; i--) {
            const cloud = this.garbageClouds[i];
            const distance = Math.sqrt(
                Math.pow(this.player.x - cloud.x, 2) +
                Math.pow(this.player.y - cloud.y, 2)
            );

            if (distance < cloud.size) {
                if (this.shieldEffect.active) continue;
                this.gameOver();
                return;
            }

            // Yaşam süresi kontrolü
            if (cloud.age > cloud.lifetime) {
                this.garbageClouds.splice(i, 1);
            }
        }

        // Mıknatıs toplama
        for (let i = this.magnets.length - 1; i >= 0; i--) {
            const magnet = this.magnets[i];
            const distance = Math.sqrt(
                Math.pow(this.player.x - magnet.x, 2) +
                Math.pow(this.player.y - magnet.y, 2)
            );

            if (distance < 40 && !magnet.collected) {
                magnet.collected = true;
                this.magnetEffect.active = true;
                this.magnetEffect.duration = this.magnetEffect.maxDuration;

                const collectParticles = this.effects.createParticles(
                    magnet.x,
                    magnet.y,
                    'rgba(255, 255, 0, 0.8)',
                    12,
                    6
                );
                this.particles.push(...collectParticles);
                this.magnets.splice(i, 1);
            } else if (magnet.y > this.canvas.height + 50) {
                this.magnets.splice(i, 1);
            }
        }

        // Kalkan toplama
        for (let i = this.shields.length - 1; i >= 0; i--) {
            const shield = this.shields[i];
            const distance = Math.sqrt(
                Math.pow(this.player.x - shield.x, 2) +
                Math.pow(this.player.y - shield.y, 2)
            );

            if (distance < 40 && !shield.collected) {
                shield.collected = true;
                this.shieldEffect.active = true;
                this.shieldEffect.duration = this.shieldEffect.maxDuration;

                const collectParticles = this.effects.createParticles(
                    shield.x,
                    shield.y,
                    'rgba(0, 150, 255, 0.8)',
                    12,
                    6
                );
                this.particles.push(...collectParticles);
                this.shields.splice(i, 1);
            } else if (shield.y > this.canvas.height + 50) {
                this.shields.splice(i, 1);
            }
        }

        // Düşman balık çarpışmaları
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (checkCollision(this.player, enemy)) {
                if (enemy.type === 'jellyfish') {
                    if (this.shieldEffect.active) continue;

                    if (!this.playerSlowEffect.active) {
                        this.playerSlowEffect.active = true;
                        this.playerSlowEffect.duration = 300;
                    }

                    const newParticles = this.effects.createParticles(
                        enemy.x,
                        enemy.y,
                        'rgba(255, 100, 255, 0.8)',
                        20,
                        3
                    );
                    this.particles.push(...newParticles);
                    this.enemies.splice(i, 1);

                } else if (enemy.canEat) {
                    this.addXP(enemy.xpValue);
                    this.fishCurrency += 1;
                    this.ui.addFishCurrency(1);
                    this.sessionEatenFish += 1;

                    const newParticles = this.effects.createParticles(
                        enemy.x,
                        enemy.y,
                        enemy.color,
                        CONFIG.PARTICLE_COUNT,
                        CONFIG.PARTICLE_SPEED
                    );
                    this.particles.push(...newParticles);
                    this.effects.showXPPopup(enemy.x, enemy.y, enemy.xpValue);
                    this.enemies.splice(i, 1);

                } else {
                    if (this.shieldEffect.active) continue;
                    this.gameOver();
                    return;
                }
            }
        }

        // Kanca-balık etkileşimleri
        for (const hook of this.hooks) {
            if (hook.state !== 'fishing') continue;

            // Player kanca kontrolü
            const playerDistance = Math.sqrt(
                Math.pow(this.player.x - hook.x, 2) +
                Math.pow(this.player.y - hook.y, 2)
            );

            if (playerDistance < 35 && !this.player.isHooked) {
                this.hookPlayer(hook);
                const splashParticles = this.effects.createParticles(
                    hook.x,
                    hook.y,
                    'rgba(255, 100, 100, 0.8)',
                    12,
                    6
                );
                this.particles.push(...splashParticles);
                continue;
            }

            // Düşman balık kontrolü
            for (const enemy of this.enemies) {
                if (enemy.type === 'jellyfish' || enemy.isHooked) continue;

                const distance = Math.sqrt(
                    Math.pow(enemy.x - hook.x, 2) +
                    Math.pow(enemy.y - hook.y, 2)
                );

                if (distance < 35) {
                    this.hookFish(enemy, hook);
                    const splashParticles = this.effects.createParticles(
                        hook.x,
                        hook.y,
                        'rgba(100, 200, 255, 0.8)',
                        8,
                        4
                    );
                    this.particles.push(...splashParticles);
                    break;
                }
            }
        }

        // Takılı balıkların ekrandan çıkma kontrolü
        for (let i = this.hookedFish.length - 1; i >= 0; i--) {
            const hookedFish = this.hookedFish[i];
            const hook = hookedFish.hook;

            // Kanca kaldırıldıysa veya ekrandan çıktıysa
            if (!this.hooks.includes(hook) || hook.y < -100) {
                if (hookedFish.isPlayer) {
                    this.gameOver();
                    return;
                } else {
                    const fish = hookedFish.fish;
                    const fishIndex = this.enemies.indexOf(fish);
                    if (fishIndex > -1) {
                        this.enemies.splice(fishIndex, 1);
                    }
                    this.hookedFish.splice(i, 1);
                }
            }
        }
    }

    // Mouse hareketi
    handleMouseMove(event) {
        if (this.isMouseDown || !this.isSlowMotionActive) {
            this.lastMousePosition.x = event.clientX;
            this.lastMousePosition.y = event.clientY;
        }
    }

    // Dokunma hareketi
    handleTouchMove(event) {
        if (event.touches.length > 0) {
            this.lastMousePosition.x = event.touches[0].clientX;
            this.lastMousePosition.y = event.touches[0].clientY;
        }
    }

    // Dokunma/tıklama başlangıcı
    handleTouchStart(event) {
        this.isTouching = true;
        this.isMouseDown = true;

        // Mouse/touch pozisyonunu güncelle
        if (event.type === 'mousedown') {
            this.lastMousePosition.x = event.clientX;
            this.lastMousePosition.y = event.clientY;
        } else if (event.type === 'touchstart' && event.touches.length > 0) {
            this.lastMousePosition.x = event.touches[0].clientX;
            this.lastMousePosition.y = event.touches[0].clientY;
        }

        // Yavaşlatma modundan çık ve normal hıza dön
        if (this.isSlowMotionActive) {
            this.resumeGame();
        }
    }

    // Dokunma/tıklama bitişi
    handleTouchEnd() {
        this.isTouching = false;
        this.isMouseDown = false;
        this.slowMotionTimer = 0;
    }

    // Temizleme fonksiyonunu güncelle
    cleanup() {
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchend', this.handleTouchEnd);
        document.removeEventListener('mousedown', this.handleTouchStart);
        document.removeEventListener('mouseup', this.handleTouchEnd);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('touchmove', this.handleTouchMove);
    }

    // XP bar pozisyonunu güncelle
    updateXPBarPosition(timestamp) {
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        const xpContainer = document.querySelector('.floating-xp-container');
        if (xpContainer && this.player) {
            // Hedef pozisyonu hesapla - Y pozisyonunu daha yukarı al
            const targetX = this.player.x - 30;
            const targetY = this.player.y - this.player.size - 30;

            // Mevcut pozisyonu yumuşak bir şekilde güncelle
            const smoothFactor = 1 - Math.pow(0.001, deltaTime / 16);
            this.xpBarPosition.x += (targetX - this.xpBarPosition.x) * smoothFactor;
            this.xpBarPosition.y += (targetY - this.xpBarPosition.y) * smoothFactor;

            // Pozisyonu uygula
            xpContainer.style.transform = `translate(${this.xpBarPosition.x}px, ${this.xpBarPosition.y}px)`;
        }

        requestAnimationFrame(this.updateXPBarPosition);
    }
}

