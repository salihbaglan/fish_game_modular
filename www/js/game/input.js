// input.js - Kullanıcı giriş yönetimi

export default class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouseX = canvas.width / 2;
        this.mouseY = canvas.height / 2;
        this.touchActive = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchActive = true;
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouseX = touch.clientX - rect.left;
            this.mouseY = touch.clientY - rect.top - 80;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.touchActive) {
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                this.mouseX = touch.clientX - rect.left;
                this.mouseY = touch.clientY - rect.top - 80;
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchActive = false;
        });
    }
    
    getMousePosition() {
        return {
            x: this.mouseX,
            y: this.mouseY
        };
    }
}
