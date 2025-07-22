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
        this.totalFishCurrency = parseInt(localStorage.getItem('totalFishCurrency')) || 10000;
        this.updateTotalFishCurrencyDisplay();

        // Upgrade seviyeleri
        this.upgradeData = {
            magnet: {
                level: parseInt(localStorage.getItem('magnetLevel')) || 1,
                maxLevel: 5,
                baseDuration: 10, // saniye
                maxDuration: 30,  // saniye
                baseCost: 50,
                costMultiplier: 2.5
            },
            shield: {
                level: parseInt(localStorage.getItem('shieldLevel')) || 1,
                maxLevel: 5,
                baseDuration: 10, // saniye
                maxDuration: 30,  // saniye
                baseCost: 75,
                costMultiplier: 2.5
            }
        };

        // Ayarları yükle
        this.loadSettings();

        this.initStartScreenEventListeners();
        this.updateShopDisplay();

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

        // Yeni Yükseltme Sistemi
        const magnetUpgradeBtn = document.getElementById('magnetUpgradeBtn');
        const shieldUpgradeBtn = document.getElementById('shieldUpgradeBtn');

        if (magnetUpgradeBtn) {
            magnetUpgradeBtn.addEventListener('click', () => this.upgradeItem('magnet'));
        }

        if (shieldUpgradeBtn) {
            shieldUpgradeBtn.addEventListener('click', () => this.upgradeItem('shield'));
        }

        // Ses ayarları
        if(this.soundToggle) {
            this.soundToggle.addEventListener('change', () => {
                const isEnabled = this.soundToggle.checked;
                localStorage.setItem('soundEnabled', isEnabled);
                console.log('Ses efektleri:', isEnabled ? 'Açık' : 'Kapalı');
            });
        }

        // Görsel efekt ayarları
        if(this.vfxToggle) {
            this.vfxToggle.addEventListener('change', () => {
                const isEnabled = this.vfxToggle.checked;
                localStorage.setItem('vfxEnabled', isEnabled);
                console.log('Görsel efektler:', isEnabled ? 'Açık' : 'Kapalı');
            });
        }

        // Dil ayarları
        const languageSelect = document.getElementById('languageSelect');
        if(languageSelect) {
            languageSelect.addEventListener('change', () => {
                const selectedLanguage = languageSelect.value;
                localStorage.setItem('selectedLanguage', selectedLanguage);
                console.log('Dil değiştirildi:', selectedLanguage);
                // Burada dil değiştirme fonksiyonu çağrılabilir
            });
        }
    }

    // Ayarları yükle
    loadSettings() {
        // Ses ayarları
        const soundEnabled = localStorage.getItem('soundEnabled');
        if (soundEnabled !== null) {
            this.soundToggle.checked = soundEnabled === 'true';
        } else {
            this.soundToggle.checked = true; // Default açık
            localStorage.setItem('soundEnabled', 'true');
        }

        // Görsel efekt ayarları
        const vfxEnabled = localStorage.getItem('vfxEnabled');
        if (vfxEnabled !== null) {
            this.vfxToggle.checked = vfxEnabled === 'true';
        } else {
            this.vfxToggle.checked = true; // Default açık
            localStorage.setItem('vfxEnabled', 'true');
        }

        // Dil ayarları
        const languageSelect = document.getElementById('languageSelect');
        const selectedLanguage = localStorage.getItem('selectedLanguage');
        if (selectedLanguage && languageSelect) {
            languageSelect.value = selectedLanguage;
        } else {
            // Default İngilizce
            if (languageSelect) languageSelect.value = 'en';
            localStorage.setItem('selectedLanguage', 'en');
        }
    }

    // Ayar getter metodları
    isSoundEnabled() {
        return localStorage.getItem('soundEnabled') === 'true';
    }

    isVfxEnabled() {
        return localStorage.getItem('vfxEnabled') === 'true';
    }

    getCurrentLanguage() {
        return localStorage.getItem('selectedLanguage') || 'en';
    }

    updateTotalFishCurrencyDisplay() {
        if (this.totalFishCountElement) {
            this.totalFishCountElement.textContent = this.totalFishCurrency;
        }
    }

    // Upgrade hesaplamaları
    calculateUpgradeCost(upgradeType, level) {
        const data = this.upgradeData[upgradeType];
        if (level >= data.maxLevel) return 0;

        // Exponential cost scaling: baseCost * (multiplier ^ (level - 1))
        return Math.floor(data.baseCost * Math.pow(data.costMultiplier, level - 1));
    }

    calculateUpgradeDuration(upgradeType, level) {
        const data = this.upgradeData[upgradeType];
        // Linear progression from baseDuration to maxDuration
        const progress = (level - 1) / (data.maxLevel - 1);
        return Math.floor(data.baseDuration + (data.maxDuration - data.baseDuration) * progress);
    }

    // Upgrade işlemi
    upgradeItem(upgradeType) {
        const data = this.upgradeData[upgradeType];

        if (data.level >= data.maxLevel) {
            alert('Bu öğe maksimum seviyede!');
            return;
        }

        const cost = this.calculateUpgradeCost(upgradeType, data.level);

        if (this.totalFishCurrency >= cost) {
            this.totalFishCurrency -= cost;
            data.level++;

            // LocalStorage'a kaydet
            localStorage.setItem('totalFishCurrency', this.totalFishCurrency);
            localStorage.setItem(`${upgradeType}Level`, data.level);

            // UI'ı güncelle
            this.updateTotalFishCurrencyDisplay();
            this.updateShopDisplay();

            alert(`${upgradeType === 'magnet' ? 'Mıknatıs' : 'Kalkan'} seviye ${data.level}'e yükseltildi!`);
        } else {
            alert('Yetersiz balık! Daha fazla balık yemelisiniz.');
        }
    }

    // Shop görünümünü güncelle
    updateShopDisplay() {
        // Mıknatıs güncelleme
        this.updateUpgradeDisplay('magnet');
        // Kalkan güncelleme
        this.updateUpgradeDisplay('shield');
    }

    updateUpgradeDisplay(upgradeType) {
        const data = this.upgradeData[upgradeType];
        const level = data.level;
        const maxLevel = data.maxLevel;

        // Level display
        const levelElement = document.getElementById(`${upgradeType}Level`);
        if (levelElement) {
            levelElement.textContent = level;
        }

        // Duration display
        const durationElement = document.getElementById(`${upgradeType}Duration`);
        if (durationElement) {
            const duration = this.calculateUpgradeDuration(upgradeType, level);
            durationElement.textContent = `${duration}s`;
        }

        // Cost display and button state
        const costElement = document.getElementById(`${upgradeType}Cost`);
        const upgradeBtn = document.getElementById(`${upgradeType}UpgradeBtn`);

        if (level >= maxLevel) {
            if (costElement) costElement.textContent = 'MAX';
            if (upgradeBtn) {
                upgradeBtn.disabled = true;
                upgradeBtn.innerHTML = '<span>Maksimum Seviye</span>';
            }
        } else {
            const cost = this.calculateUpgradeCost(upgradeType, level);
            if (costElement) costElement.textContent = cost;
            if (upgradeBtn) {
                upgradeBtn.disabled = false;
                upgradeBtn.innerHTML = `<span>Yükselt</span> (${cost} <img src="assets/images/eating_fish.png" class="currency-inline">)`;
            }
        }

        // Progress bar and dots
        const progressElement = document.getElementById(`${upgradeType}SliderProgress`);
        if (progressElement) {
            const progress = (level / maxLevel) * 100;
            progressElement.style.width = `${progress}%`;
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

        // Shop paneli açıldığında display'i güncelle
        if (panelId === 'shopPanel') {
            this.updateShopDisplay();
        }
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
