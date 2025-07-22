// Inactivity control variables
let lastInteractionTime = Date.now();
let isGamePaused = false;
let originalGameSpeed = 1; // Normal oyun hızı
let inactivityTimeout = 3000; // 3 saniye sonra yavaşlamaya başla
let gameSpeedWhenInactive = 0.3; // İnaktif durumdaki oyun hızı (0.3x)

// Touch ve mouse eventlerini dinle
function setupInactivityDetection() {
    const gameContainer = document.querySelector('.game-container');
    const overlay = document.querySelector('.game-overlay');

    function handleInteraction() {
        lastInteractionTime = Date.now();
        if (isGamePaused) {
            resumeGame();
        }
    }

    // Touch ve mouse eventlerini dinle
    gameContainer.addEventListener('touchstart', handleInteraction);
    gameContainer.addEventListener('touchmove', handleInteraction);
    gameContainer.addEventListener('mousedown', handleInteraction);
    gameContainer.addEventListener('mousemove', handleInteraction);

    // İnaktivite kontrolü
    setInterval(checkInactivity, 100);
}

function checkInactivity() {
    const currentTime = Date.now();
    const timeSinceLastInteraction = currentTime - lastInteractionTime;

    if (timeSinceLastInteraction > inactivityTimeout && !isGamePaused) {
        slowDownGame();
    }
}

function slowDownGame() {
    isGamePaused = true;
    const overlay = document.querySelector('.game-overlay');
    overlay.classList.add('inactive');

    // Oyun hızını yavaşça azalt
    const slowdownDuration = 1000; // 1 saniye
    const startTime = Date.now();
    
    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / slowdownDuration, 1);
        
        const currentSpeed = originalGameSpeed - (progress * (originalGameSpeed - gameSpeedWhenInactive));
        setGameSpeed(currentSpeed);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

function resumeGame() {
    isGamePaused = false;
    const overlay = document.querySelector('.game-overlay');
    overlay.classList.remove('inactive');

    // Oyun hızını yavaşça normale döndür
    const speedupDuration = 500; // 0.5 saniye
    const startTime = Date.now();
    
    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / speedupDuration, 1);
        
        const currentSpeed = gameSpeedWhenInactive + (progress * (originalGameSpeed - gameSpeedWhenInactive));
        setGameSpeed(currentSpeed);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

// Oyun hızını ayarla (bu fonksiyonu kendi oyun loop'unuza entegre etmelisiniz)
function setGameSpeed(speed) {
    // Burada oyununuzun hızını ayarlayan kodu yazın
    // Örnek:
    // gameLoop.timeScale = speed;
    // veya
    // deltaTime *= speed;
}

// Oyun başladığında inaktivite kontrolünü başlat
setupInactivityDetection(); 