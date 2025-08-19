// effects.js - Oyun efektleri

export default class Effects {
    constructor(gameContainer) {
        this.gameContainer = gameContainer;
        this.bubblesContainer = document.getElementById('bubbles');
    }

    // Parçacık efekti
    createParticles(x, y, color, count = 12, speed = 12) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                life: 1,
                color: color
            });
        }
        return particles;
    }

    // Bomba patlama efekti
    createExplosionEffect(x, y) {
        const particles = [];
        
        // Ana patlama parçacıkları (turuncu-kırmızı)
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const speed = 8 + Math.random() * 12;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: `hsl(${Math.random() * 60 + 10}, 100%, ${50 + Math.random() * 30}%)`, // Turuncu-kırmızı
                size: 3 + Math.random() * 4
            });
        }
        
        // İkinci dalga parçacıkları (sarı-beyaz)
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 8;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.8,
                color: `hsl(${Math.random() * 60 + 40}, 100%, ${70 + Math.random() * 30}%)`, // Sarı-beyaz
                size: 2 + Math.random() * 3
            });
        }
        
        // Duman parçacıkları (gri)
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2, // Yukarı doğru
                life: 1.2,
                color: `rgba(${100 + Math.random() * 50}, ${100 + Math.random() * 50}, ${100 + Math.random() * 50}, 0.6)`,
                size: 4 + Math.random() * 6
            });
        }
        
        return particles;
    }

    // Su patlama efekti
    createWaterExplosionEffect(x, y, radius) {
        const particles = [];
        
        // Su damlacıkları (mavi-beyaz)
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 0.8;
            const speed = 3 + Math.random() * 6;
            
            particles.push({
                x: x + Math.cos(angle) * distance * 0.3,
                y: y + Math.sin(angle) * distance * 0.3,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1, // Hafif yukarı
                life: 1,
                color: `rgba(${100 + Math.random() * 155}, ${200 + Math.random() * 55}, 255, 0.8)`,
                size: 2 + Math.random() * 4
            });
        }
        
        // Su halkaları (şeffaf mavi)
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const speed = 4 + Math.random() * 4;
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.8,
                color: `rgba(100, 200, 255, 0.4)`,
                size: 3 + Math.random() * 5
            });
        }
        
        // Köpük efekti (beyaz)
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2, // Yukarı doğru
                life: 1.5,
                color: `rgba(255, 255, 255, ${0.6 + Math.random() * 0.4})`,
                size: 1 + Math.random() * 3
            });
        }
        
        return particles;
    }

    // Buble.png ile baloncuk efekti
    createBubbleExplosionEffect(x, y) {
        const bubbles = [];
        
        // 8-12 baloncuk oluştur
        const bubbleCount = 8 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < bubbleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const size = 20 + Math.random() * 40; // 20-60px arası boyut (128x128'den küçültülmüş)
            
            bubbles.push({
                x: x + (Math.random() - 0.5) * 60, // Patlama merkezinden dağılım
                y: y + (Math.random() - 0.5) * 40,
                vx: Math.cos(angle) * speed * 0.3, // Yavaş yanlara hareket
                vy: -2 - Math.random() * 3, // Yukarı doğru hareket
                life: 1,
                maxLife: 1,
                size: size,
                type: 'bubble',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                alpha: 0.7 + Math.random() * 0.3
            });
        }
        
        return bubbles;
    }

    // Ekran sallama efekti
    createScreenShake(intensity = 10, duration = 300) {
        const gameContainer = this.gameContainer;
        const originalTransform = gameContainer.style.transform || '';
        
        let startTime = Date.now();
        
        const shake = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                // Sallama bitir
                gameContainer.style.transform = originalTransform;
                return;
            }
            
            // Sallama şiddeti zamanla azalır
            const currentIntensity = intensity * (1 - progress);
            const offsetX = (Math.random() - 0.5) * currentIntensity;
            const offsetY = (Math.random() - 0.5) * currentIntensity;
            
            gameContainer.style.transform = `${originalTransform} translate(${offsetX}px, ${offsetY}px)`;
            
            requestAnimationFrame(shake);
        };
        
        shake();
    }

    // MMORPG stilinde XP popup
    showXPPopup(x, y, xp) {
        const popup = document.createElement('div');
        popup.className = 'mmorpg-xp-popup';
        popup.innerHTML = `
            <div class="xp-text">+${xp}</div>
            <div class="xp-label">XP</div>
        `;
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        
        this.gameContainer.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1500);
    }

    // MMORPG stilinde Level Up popup
    showLevelUpPopup(level) {
        const popup = document.createElement('div');
        popup.className = 'mmorpg-levelup-popup';
        popup.innerHTML = `
            <div class="levelup-glow"></div>
            <div class="levelup-main">
                <div class="levelup-title">LEVEL UP!</div>
                <div class="levelup-number">${level}</div>
                <div class="levelup-subtitle">Seviye Atladın!</div>
            </div>
        `;
        
        this.gameContainer.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 3000);
    }

    // Skor popup efekti
    showScorePopup(x, y, points) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        this.gameContainer.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }

    // Baloncuk efekti
    createBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        const size = Math.random() * 20 + 5;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = Math.random() * window.innerWidth + 'px';
        bubble.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        this.bubblesContainer.appendChild(bubble);
        
        setTimeout(() => {
            bubble.remove();
        }, 4000);
    }

    // Başlangıç baloncukları
    createInitialBubbles(count = 5) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => this.createBubble(), i * 500);
        }
    }

    // Balık nefes alma baloncukları oluştur
    createBreathingBubbles(fishX, fishY, fishSize, intensity = 1) {
        const bubbleCount = Math.floor(intensity * 3);
        
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'breathing-bubble';
            
            // Balığın solungaç bölgesinden çıkacak şekilde konumlandır
            const offsetX = (Math.random() - 0.5) * fishSize * 0.3;
            const offsetY = (Math.random() - 0.5) * fishSize * 0.2;
            
            bubble.style.left = (fishX - fishSize * 0.6 + offsetX) + 'px';
            bubble.style.top = (fishY + offsetY) + 'px';
            bubble.style.width = (2 + Math.random() * 4) + 'px';
            bubble.style.height = bubble.style.width;
            bubble.style.background = 'rgba(173, 216, 230, 0.6)';
            bubble.style.borderRadius = '50%';
            bubble.style.position = 'absolute';
            bubble.style.pointerEvents = 'none';
            bubble.style.animation = `breathingBubbleFloat ${1 + Math.random()}s ease-out forwards`;
            
            this.bubblesContainer.appendChild(bubble);
            
            // Baloncuğu otomatik olarak temizle
            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
            }, 1500);
        }
    }

    // Balık hareket ederken su dalgaları efekti
    createWaterRipples(fishX, fishY, fishSize, speed) {
        if (speed < 2) return; // Yavaş hareket ediyorsa dalga oluşturma
        
        const ripple = document.createElement('div');
        ripple.className = 'water-ripple';
        ripple.style.left = (fishX - fishSize) + 'px';
        ripple.style.top = (fishY - fishSize) + 'px';
        ripple.style.width = (fishSize * 2) + 'px';
        ripple.style.height = (fishSize * 2) + 'px';
        ripple.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        ripple.style.borderRadius = '50%';
        ripple.style.position = 'absolute';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'waterRipple 0.8s ease-out forwards';
        
        this.bubblesContainer.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 800);
    }

    // Parçacıkları çiz
    drawParticles(ctx, particles) {
        particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
            ctx.restore();
        });
    }

    // Parçacıkları güncelle
    updateParticles(particles, deltaTime) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= deltaTime * 2;
            
            if (particle.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }
}
