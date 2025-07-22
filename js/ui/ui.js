// ui.js - Kullanıcı arayüzü yönetimi
import { getString, updateDynamicTexts } from '../utils/localization.js'; // getString ve updateDynamicTexts'i dahil et
export default class UI {
    constructor() {
        // Oyun İçi UI elementleri
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.playerLevelElement = document.getElementById('playerLevel');
        this.xpProgressElement = document.getElementById('xpProgress');
        this.xpTextElement = document.getElementById('xpText');
        this.magnetBarElement = document.getElementById('magnetBar');
        this.magnetProgressElement = document.getElementById('magnetProgress');
        this.magnetTextElement = document.getElementById('magnetText');
        this.shieldBarElement = document.getElementById('shieldBar'); // Kalkan bar için
        this.shieldProgressElement = document.getElementById('shieldProgress'); // Kalkan progress için
        this.shieldTextElement = document.getElementById('shieldText'); // Kalkan text için
        this.eatenFishCountElement = document.getElementById('eatenFishCount'); // Bu oturumda yenen balık sayısı için
        this.gameTimerElement = document.getElementById('gameTimer'); // Timer için

        // Ekranlar
        this.startScreenElement = document.getElementById('startScreen');
        this.gameOverScreenElement = document.getElementById('gameOverScreen');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalLevelElement = document.getElementById('finalLevel');
        this.gameOverMessageElement = document.getElementById('gameOverMessage');

        // Başlangıç Ekranı UI Elementleri
        this.totalFishCountElement = document.getElementById('totalFishCount');
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.panels = document.querySelectorAll('.panel');
        this.closePanelButtons = document.querySelectorAll('.close-panel-btn');
        this.upgradeButtons = document.querySelectorAll('.btn-upgrade');
        this.soundToggle = document.getElementById('soundToggle');
        this.vfxToggle = document.getElementById('vfxToggle');
        
        // Başlangıçta toplam balık sayısını yükle (localStorage'dan veya varsayılan)
        this.totalFishCurrency = parseInt(localStorage.getItem('totalFishCurrency')) || 0;
        this.updateTotalFishCurrencyDisplay();

        this.initStartScreenEventListeners();

        // Overlay elementleri
        this.overlay = document.querySelector('.game-overlay');
        this.overlayMessage = this.overlay?.querySelector('.message');
    }

    initStartScreenEventListeners() {
        this.navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const panelId = button.dataset.panel;
                this.openPanel(panelId);
            });
        });

        this.closePanelButtons.forEach(button => {
            button.addEventListener('click', () => {
                const panelId = button.dataset.panel;
                this.closePanel(panelId);
            });
        });

        // Örnek Yükseltme Butonları (Daha sonra game logic ile entegre edilecek)
        this.upgradeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const upgradeType = button.dataset.upgrade;
                // Gerekli para birimi miktarını al (şimdilik sabit)
                const cost = upgradeType === 'magnet' ? 100 : 150;
                if (this.totalFishCurrency >= cost) {
                    this.totalFishCurrency -= cost;
                    localStorage.setItem('totalFishCurrency', this.totalFishCurrency);
                    this.updateTotalFishCurrencyDisplay();
                    alert(getString('upgradeSuccessful', { item: getString(upgradeType === 'magnet' ? 'upgradeMagnetLabel' : 'upgradeShieldLabel') }));
                    // İlgili level span'ını güncelle (örnek)
                    const levelSpan = document.getElementById(`${upgradeType}Level`);
                    if(levelSpan) {
                        let currentLevelText = levelSpan.textContent.match(/\d+/); // Sadece sayıyı al
                        let currentLevel = currentLevelText ? parseInt(currentLevelText[0]) : 1;
                        levelSpan.innerHTML = `<span data-translate-key="levelAbbreviation">${getString('levelAbbreviation')}</span> ${currentLevel + 1}`;
                    }
                    updateDynamicTexts(); // Buton metinlerini ve maliyetlerini güncelle
                } else {
                    alert(getString('insufficientFish'));
                }
            });
        });

        if(this.soundToggle) {
            this.soundToggle.addEventListener('change', (event) => {
                // Ses efektlerini aç/kapat
                // Burada ses efektlerini yönetecek bir fonksiyon çağrılabilir
            });
        }

        if(this.vfxToggle) {
            this.vfxToggle.addEventListener('change', (event) => {
                // Görsel efektleri aç/kapat
                // Burada görsel efektleri yönetecek bir fonksiyon çağrılabilir
            });
        }
    }

    updateTotalFishCurrencyDisplay() {
        if (this.totalFishCountElement) {
            this.totalFishCountElement.textContent = this.totalFishCurrency;
        }
    }
    
    // Oyuncuya balık para birimi ekle
    addFishCurrency(amount) {
        this.totalFishCurrency += amount;
        localStorage.setItem('totalFishCurrency', this.totalFishCurrency);
        this.updateTotalFishCurrencyDisplay();
    }

    openPanel(panelId) {
        this.panels.forEach(panel => panel.classList.remove('active'));
        this.navButtons.forEach(btn => btn.classList.remove('active'));

        const panelToShow = document.getElementById(panelId);
        const activeButton = document.querySelector(`.nav-btn[data-panel="${panelId}"]`);
        
        if (panelToShow) panelToShow.classList.add('active');
        if (activeButton) activeButton.classList.add('active');
    }

    closePanel(panelId) {
        const panelToClose = document.getElementById(panelId);
        const activeButton = document.querySelector(`.nav-btn[data-panel="${panelId}"]`);

        if (panelToClose) panelToClose.classList.remove('active');
        if (activeButton) activeButton.classList.remove('active');
    }

    // UI güncelleme (Oyun İçi)
    updateUI(score, highScore, playerLevel, playerSize, cameraZoom, currentXP, xpToNextLevel, magnetEffect = null, shieldEffect = null, sessionEatenFish = 0, gameTimer = 0) {
        this.scoreElement.textContent = score;
        this.highScoreElement.textContent = highScore;
        this.playerLevelElement.textContent = playerLevel;
        if (this.eatenFishCountElement) { // Elementin varlığını kontrol et
            this.eatenFishCountElement.textContent = sessionEatenFish;
        }
        
        // Timer güncelleme
        if (this.gameTimerElement && gameTimer !== undefined) {
            const totalSeconds = Math.floor(gameTimer / 60); // 60 FPS
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            this.gameTimerElement.textContent = formattedTime;
        }
        
        const xpProgress = (currentXP / xpToNextLevel) * 100;
        this.xpProgressElement.style.width = xpProgress + '%';
        this.xpTextElement.textContent = `${currentXP} / ${xpToNextLevel}`;
        
        // Mıknatıs efekti güncelleme
        if (magnetEffect && magnetEffect.active) {
            this.magnetBarElement.style.display = 'flex';
            const progress = (magnetEffect.duration / magnetEffect.maxDuration) * 100;
            this.magnetProgressElement.style.width = progress + '%';
            const seconds = Math.ceil(magnetEffect.duration / 60);
            this.magnetTextElement.textContent = seconds + 's';
        } else {
            this.magnetBarElement.style.display = 'none';
        }

        // Kalkan efekti güncelleme
        if (shieldEffect && shieldEffect.active) {
            this.shieldBarElement.style.display = 'flex';
            const progress = (shieldEffect.duration / shieldEffect.maxDuration) * 100;
            this.shieldProgressElement.style.width = progress + '%';
            const seconds = Math.ceil(shieldEffect.duration / 60);
            this.shieldTextElement.textContent = seconds + 's';
        } else {
            this.shieldBarElement.style.display = 'none';
        }
    }

    // Oyun başlangıç ekranını göster/gizle
    showStartScreen(show) {
        this.startScreenElement.style.display = show ? 'flex' : 'none';
        // Üstteki oyun içi paneli sadece oyun ekranında göster
        const uiPanel = document.querySelector('.ui');
        if (uiPanel) uiPanel.style.display = show ? 'none' : 'block';
        if (show) {
            // Başlangıç ekranı gösterildiğinde, açık olabilecek panelleri kapat
            this.panels.forEach(panel => panel.classList.remove('active'));
            this.navButtons.forEach(btn => btn.classList.remove('active'));
            this.updateTotalFishCurrencyDisplay(); // Para birimini güncelle
        }
    }

    // Oyun bitiş ekranını göster/gizle
    showGameOverScreen(show, score, level, sessionEatenFish = 0, gameTimer = 0, isNewHighScore = false) {
        // Game over ekranında karartma gösterme
        if (show && this.overlay) {
            this.hideMessage(1); // Eğer karartma varsa kaldır
            this.overlay.style.display = 'none'; // Karartmayı tamamen gizle
        }

        if (show) {
            if (this.finalScoreElement) this.finalScoreElement.textContent = score;
            if (this.finalLevelElement) this.finalLevelElement.textContent = level;
            
            // Yenen balık ve süreyi güncelle
            const eatenFishElem = document.getElementById('finalEatenFish');
            if (eatenFishElem) eatenFishElem.textContent = sessionEatenFish;
            
            const timeElem = document.getElementById('finalTime');
            if (timeElem) {
                const totalSeconds = Math.floor(gameTimer / 60);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                timeElem.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            
            // Yeni rekor bildirimi
            const newHighScoreRow = document.getElementById('newHighScoreRow');
            if (newHighScoreRow) newHighScoreRow.style.display = isNewHighScore ? 'block' : 'none';
            
            // Mesajı başarıya göre ayarla
            if (this.gameOverMessageElement) {
                let message = '';
                if (level >= 10) {
                    message = 'Efsanevi bir oyun!';
                } else if (level >= 5) {
                    message = 'Tebrikler, harika bir oyun!';
                } else {
                    message = 'Tekrar deneyin, daha iyisini yapabilirsiniz!';
                }
                this.gameOverMessageElement.textContent = message;
            }
        } else if (!show && this.overlay) {
            this.overlay.style.display = ''; // Oyun yeniden başladığında karartmayı tekrar aktif et
        }
        
        if (this.gameOverScreenElement) {
            this.gameOverScreenElement.style.display = show ? 'flex' : 'none';
        }
        
        // Oyun bittiğinde üstteki paneli gizle
        const uiPanel = document.querySelector('.ui');
        if (uiPanel) uiPanel.style.display = show ? 'none' : 'block';
        
        // Magnet ve shield barlarını da gizle
        if (show) {
            if (this.magnetBarElement) this.magnetBarElement.style.display = 'none';
            if (this.shieldBarElement) this.shieldBarElement.style.display = 'none';
        }
    }
    
    // Kalkan bar'ını güncelle (Bu fonksiyon updateUI içine taşındı, gerekirse ayrılabilir)
    // updateShieldBar(shieldEffect) { ... }

    // Mesaj gösterme
    showMessage(message, type = 'info', duration = 0, timeScale = 1) {
        if (!this.overlay || !this.overlayMessage) return;
        
        // Geçiş süresini timeScale ile ayarla
        const transitionDuration = 1 / timeScale;
        this.overlay.style.setProperty('--transition-duration', `${transitionDuration}s`);
        
        this.overlayMessage.textContent = message;
        this.overlay.classList.add('inactive');
        
        if (duration > 0) {
            setTimeout(() => this.hideMessage(), duration);
        }
    }

    // Mesaj gizleme
    hideMessage(timeScale = 1) {
        if (!this.overlay) return;
        
        // Geçiş süresini timeScale ile ayarla
        const transitionDuration = 1 / timeScale;
        this.overlay.style.setProperty('--transition-duration', `${transitionDuration}s`);
        
        this.overlay.classList.remove('inactive');
    }
}
