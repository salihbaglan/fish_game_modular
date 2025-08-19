// main.js - Ana uygulama başlatıcı

import Renderer from './game/renderer.js';
import Effects from './game/effects.js';
import InputHandler from './game/input.js';
import Game from './game/game.js';
import UI from './ui/ui.js';
import AudioManager from './audio/audio-manager.js';
import { saveGameData, loadHighScore } from './utils/utils.js';
import { initLocalization } from './utils/localization.js'; // Lokalizasyon modülünü dahil et

// Game state variables
let gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver'
let lastInteractionTime = Date.now();
let isGamePaused = false;
let gameSpeed = 1;
const INACTIVITY_TIMEOUT = 3000;
const GAME_SPEED_WHEN_INACTIVE = 0.3;

class GameApp {
    constructor() {
        // Canvas ve oyun container
        this.canvas = document.getElementById('gameCanvas');
        this.gameContainer = document.querySelector('.game-container');
        
        // Modülleri başlat
        this.renderer = new Renderer(this.canvas);
        this.effects = new Effects(this.gameContainer);
        this.inputHandler = new InputHandler(this.canvas);
        this.ui = new UI();
        this.audioManager = new AudioManager();

        // Oyun nesnesi
        this.game = new Game(this.canvas, this.effects, this.ui, this.audioManager); // AudioManager'ı da ilet
        
        // Global referans (renderer için)
        window.game = this.game;
        
        // High score yükle
        this.game.highScore = loadHighScore();
        
        // Pencere boyutu değiştiğinde canvas'ı yeniden boyutlandır
        window.addEventListener('resize', () => this.renderer.resizeCanvas());
        
        // İlk boyutlandırma
        this.renderer.resizeCanvas();
        
        // UI'ı güncelle
        this.updateUI();
        
        // İlk bubble'ları oluştur
        this.effects.createInitialBubbles(5);
        
        // Butonlara event listener ekle
        this.setupEventListeners();
        this.setupInactivityDetection();
        this.lastFrameTime = 0;
        this.deltaTime = 0;

        // Lokalizasyonu başlat
        initLocalization().then(() => {
            // Dil yüklendikten sonra UI'ı tekrar güncellemek gerekebilir,
            // özellikle dinamik metinler varsa.
            // Ancak translatePage() zaten çağrılıyor initLocalization içinde.
        });
    }
    
    // Event listener'ları ayarla
    setupEventListeners() {
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
        document.getElementById('homeButton').addEventListener('click', () => this.goToMainMenu());

        // İnaktivite kontrolü için event listener'lar
        ['touchstart', 'touchmove', 'mousedown', 'mousemove'].forEach(eventType => {
            this.gameContainer.addEventListener(eventType, () => {
                this.handleInteraction();
            });
        });
    }

    setupInactivityDetection() {
        this.lastInteractionTime = Date.now();
        this.checkInactivity = this.checkInactivity.bind(this);
        setInterval(this.checkInactivity, 100);
    }

    handleInteraction() {
        this.lastInteractionTime = Date.now();
        if (this.isGamePaused && gameState === 'playing') {
            this.resumeGame();
        }
    }

    checkInactivity() {
        if (gameState !== 'playing') return;

        const currentTime = Date.now();
        const timeSinceLastInteraction = currentTime - this.lastInteractionTime;

        if (timeSinceLastInteraction > INACTIVITY_TIMEOUT && !this.isGamePaused) {
            this.slowDownGame();
        }
    }

    slowDownGame() {
        if (gameState !== 'playing') return;

        this.isGamePaused = true;
        const overlay = document.querySelector('.game-overlay');
        overlay.classList.add('inactive');

        // Oyun hızını yavaşça azalt
        const slowdownDuration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            if (gameState !== 'playing') return;

            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / slowdownDuration, 1);
            
            gameSpeed = 1 - (progress * (1 - GAME_SPEED_WHEN_INACTIVE));

            if (progress < 1 && this.isGamePaused) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    resumeGame() {
        if (gameState !== 'playing') return;

        this.isGamePaused = false;
        const overlay = document.querySelector('.game-overlay');
        overlay.classList.remove('inactive');

        // Oyun hızını yavaşça normale döndür
        const speedupDuration = 500;
        const startTime = Date.now();
        
        const animate = () => {
            if (gameState !== 'playing') return;

            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / speedupDuration, 1);
            
            gameSpeed = GAME_SPEED_WHEN_INACTIVE + (progress * (1 - GAME_SPEED_WHEN_INACTIVE));

            if (progress < 1 && !this.isGamePaused) {
                requestAnimationFrame(animate);
            } else {
                gameSpeed = 1;
            }
        };

        animate();
    }
    
    // UI güncelleme
    updateUI() {
        const gameState = this.game.getGameState();
        this.ui.updateUI(
            gameState.score,
            gameState.highScore,
            gameState.playerLevel,
            gameState.player.baseSize,
            gameState.cameraZoom,
            gameState.currentXP,
            gameState.xpToNextLevel,
            gameState.magnetEffect,
            gameState.shieldEffect,
            gameState.sessionEatenFish, // sessionEatenFish parametresini ekledik
            gameState.gameTimer // Timer parametresini ekledik
        );
        // fishCurrency'yi doğrudan UI'daki ilgili metoda gönderelim.
        // UI sınıfı kendi içinde localStorage'dan okuma/yazma yapacak.
        // Bu yüzden burada doğrudan fishCurrency'yi updateUI'a göndermeye gerek yok,
        // UI constructor'ında ve addFishCurrency'de hallediliyor.
        // Sadece kalkan bar'ı için olan çağrı kalabilir.
        // this.ui.updateShieldBar(gameState.shieldEffect); // Bu satır updateUI içine taşındı.
    }
    
    // Oyun başlatma
    startGame() {
        gameState = 'playing';
        this.lastInteractionTime = Date.now();
        this.isGamePaused = false;
        gameSpeed = 1;

        // Ses ayarlarını kontrol et ve müzik başlat
        const soundEnabled = this.ui.isSoundEnabled();
        this.audioManager.setEnabled(soundEnabled);
        if (soundEnabled) {
            // Önce tüm sesleri durdur (game over sesi dahil)
            this.audioManager.stopAll();
            // Sonra oyun müziğini başlat
            this.audioManager.playMusic('gameLoop');
        }

        this.ui.showStartScreen(false);
        // Oyun başladığında üstteki paneli göster
        const uiPanel = document.querySelector('.ui');
        if (uiPanel) uiPanel.style.display = 'block';
        this.game.startGame();
        this.gameLoop();
    }
    
    // Oyunu yeniden başlatma
    restartGame() {
        this.ui.showGameOverScreen(false);
        this.startGame();
    }

    // Ana menüye dön
    goToMainMenu() {
        gameState = 'menu';
        this.ui.showGameOverScreen(false);
        this.ui.showStartScreen(true);

        // Oyun durumunu sıfırla
        this.game.gameState = 'menu';

        // UI panelini gizle
        const uiPanel = document.querySelector('.ui');
        if (uiPanel) uiPanel.style.display = 'none';
    }
    
    // Oyun bitişi
    gameOver() {
        const result = this.game.gameOver();
        saveGameData(result.highScore);
        const isNewHighScore = result.score >= result.highScore;

        // Tüm müziği durdur ve game over sesi çal
        if (this.audioManager.isEnabled) {
            this.audioManager.stopAll();
            this.audioManager.play('gameOver');
        }

        // Barları kesin kapatmak için efektleri pasif yapıp UI'yı güncelle
        this.game.magnetEffect.active = false;
        this.game.shieldEffect.active = false;
        this.updateUI();

        this.ui.showGameOverScreen(true, result.score, result.level, this.game.sessionEatenFish, this.game.gameTimer, isNewHighScore);
    }
    
    // Ana oyun döngüsü
    gameLoop() {
        if (!this.lastFrameTime) {
            this.lastFrameTime = Date.now();
        }

        this.deltaTime = (Date.now() - this.lastFrameTime) * gameSpeed;
        this.lastFrameTime = Date.now();

        if (gameState === 'playing') {
            const mousePosition = this.inputHandler.getMousePosition();
            this.game.update(mousePosition, this.deltaTime);
            
            const gameState = this.game.getGameState();

            this.renderer.drawGame(
                gameState.player,
                gameState.enemies,
                gameState.particles,
                gameState.cameraZoom,
                mousePosition.x,
                gameState.gameState
            );
            
            this.updateUI();

            // Tehlike durumu kontrolü (müzik değişimi için)
            if (this.audioManager.isEnabled) {
                this.audioManager.checkDangerState(this.game);
            }

            if (gameState.gameState === 'playing') {
                requestAnimationFrame(() => this.gameLoop());
            } else if (gameState.gameState === 'gameOver') {
                this.gameOver();
            }
        }
    }
}

// Sayfa yüklendiğinde oyunu başlat
document.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new GameApp(); // Global erişim için
    window.gameApp.gameLoop();
});
