import { authService } from '../services/authService.js';

const loginView = {
  pin: '',
  pinDots: null,
  errorMessage: null,
  pinPad: null,
  loadingOverlay: null,

  init() {
    this.pinDots = document.getElementById('pin-dots');
    this.errorMessage = document.getElementById('error-message');
    this.pinPad = document.getElementById('pin-pad');
    this.loadingOverlay = document.getElementById('loading-overlay');
    
    this.renderPinPad();
    this.attachPinPadListeners();
  },

  renderPinPad() {
    const buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '<'];
    buttons.forEach(val => {
      const btn = document.createElement('button');
      btn.className = 'pin-btn';
      btn.dataset.value = val;
      btn.textContent = val;
      this.pinPad.appendChild(btn);
    });
  },

  attachPinPadListeners() {
    this.pinPad.addEventListener('click', (e) => {
      if (e.target.matches('.pin-btn')) {
        const value = e.target.dataset.value;
        this.handlePinInput(value);
      }
    });
  },

  async handlePinInput(value) {
    this.clearError();
    if (value === 'C') {
      this.pin = '';
    } else if (value === '<') {
      this.pin = this.pin.slice(0, -1);
    } else if (this.pin.length < 4) {
      this.pin += value;
    }

    this.updatePinDots();

    if (this.pin.length === 4) {
      this.showLoading(true);
      const success = await authService.login(this.pin);
      this.showLoading(false);
      
      if (success) {
        window.location.href = 'pos.html';
      } else {
        this.showError('รหัสผ่านไม่ถูกต้อง');
        this.pin = '';
        setTimeout(() => this.updatePinDots(), 500);
      }
    }
  },

  updatePinDots() {
    const dots = this.pinDots.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('filled', i < this.pin.length);
    }
  },

  showError(message) {
    this.errorMessage.textContent = message;
    this.pinDots.parentElement.classList.add('shake');
    setTimeout(() => {
      this.pinDots.parentElement.classList.remove('shake');
    }, 500);
  },

  clearError() {
    this.errorMessage.textContent = '';
  },

  showLoading(isLoading) {
    this.loadingOverlay.style.display = isLoading ? 'flex' : 'none';
  }
};

loginView.init();

