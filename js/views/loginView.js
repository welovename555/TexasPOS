import { authService } from '../services/authService.js';

const loginView = {
  pin: '',
  pinDots: null,
  errorMessage: null,
  pinPad: null,
  loadingOverlay: null,
  pinDisplay: null,

  init() {
    this.pinDots = document.getElementById('pin-dots');
    this.errorMessage = document.getElementById('error-message');
    this.pinPad = document.getElementById('pin-pad');
    this.loadingOverlay = document.getElementById('loading-overlay');
    this.pinDisplay = document.querySelector('.pin-display');
    
    this.renderPinPad();
    this.attachPinPadListeners();
    this.addKeyboardSupport();
  },

  renderPinPad() {
    const buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '<'];
    
    buttons.forEach(val => {
      const btn = document.createElement('button');
      btn.className = 'pin-btn';
      btn.dataset.value = val;
      
      // Add special styling for action buttons
      if (val === 'C') {
        btn.innerHTML = '⌫';
        btn.title = 'ล้างทั้งหมด';
      } else if (val === '<') {
        btn.innerHTML = '←';
        btn.title = 'ลบ';
      } else {
        btn.textContent = val;
      }
      
      this.pinPad.appendChild(btn);
    });
  },

  attachPinPadListeners() {
    this.pinPad.addEventListener('click', (e) => {
      if (e.target.matches('.pin-btn')) {
        const value = e.target.dataset.value;
        this.handlePinInput(value);
        this.addButtonFeedback(e.target);
      }
    });
  },

  addKeyboardSupport() {
    document.addEventListener('keydown', (e) => {
      // Handle number keys
      if (e.key >= '0' && e.key <= '9') {
        this.handlePinInput(e.key);
        this.highlightButton(e.key);
      }
      // Handle backspace
      else if (e.key === 'Backspace') {
        this.handlePinInput('<');
        this.highlightButton('<');
      }
      // Handle escape or delete for clear
      else if (e.key === 'Escape' || e.key === 'Delete') {
        this.handlePinInput('C');
        this.highlightButton('C');
      }
    });
  },

  highlightButton(value) {
    const btn = document.querySelector(`[data-value="${value}"]`);
    if (btn) {
      this.addButtonFeedback(btn);
    }
  },

  addButtonFeedback(button) {
    // Add visual feedback
    button.style.transform = 'translateY(0px) scale(0.95)';
    button.style.background = 'rgba(255, 255, 255, 0.3)';
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Reset after animation
    setTimeout(() => {
      button.style.transform = '';
      button.style.background = '';
    }, 150);
  },

  async handlePinInput(value) {
    this.clearError();
    
    if (value === 'C') {
      this.pin = '';
      this.addClearAnimation();
    } else if (value === '<') {
      this.pin = this.pin.slice(0, -1);
      this.addBackspaceAnimation();
    } else if (this.pin.length < 4) {
      this.pin += value;
      this.addInputAnimation();
    }

    this.updatePinDots();

    if (this.pin.length === 4) {
      await this.processLogin();
    }
  },

  addClearAnimation() {
    this.pinDots.style.transform = 'scale(0.9)';
    setTimeout(() => {
      this.pinDots.style.transform = '';
    }, 200);
  },

  addBackspaceAnimation() {
    const lastFilledDot = this.pinDots.children[this.pin.length];
    if (lastFilledDot) {
      lastFilledDot.style.transform = 'scale(0.8)';
      setTimeout(() => {
        lastFilledDot.style.transform = '';
      }, 200);
    }
  },

  addInputAnimation() {
    const currentDot = this.pinDots.children[this.pin.length - 1];
    if (currentDot) {
      currentDot.style.transform = 'scale(1.2)';
      setTimeout(() => {
        currentDot.style.transform = '';
      }, 300);
    }
  },

  updatePinDots() {
    const dots = this.pinDots.children;
    
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      const isFilled = i < this.pin.length;
      
      if (isFilled && !dot.classList.contains('filled')) {
        // Add fill animation
        dot.style.transform = 'scale(0.8)';
        setTimeout(() => {
          dot.classList.add('filled');
          dot.style.transform = 'scale(1.1)';
          setTimeout(() => {
            dot.style.transform = '';
          }, 200);
        }, 100);
      } else if (!isFilled && dot.classList.contains('filled')) {
        // Add empty animation
        dot.style.transform = 'scale(1.1)';
        setTimeout(() => {
          dot.classList.remove('filled');
          dot.style.transform = 'scale(0.8)';
          setTimeout(() => {
            dot.style.transform = '';
          }, 200);
        }, 100);
      }
    }
  },

  async processLogin() {
    this.showLoading(true);
    this.disablePinPad(true);
    
    try {
      // Add small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const success = await authService.login(this.pin);
      
      if (success) {
        this.showSuccess();
        // Add delay before redirect for success animation
        setTimeout(() => {
          window.location.href = 'pos.html';
        }, 1000);
      } else {
        this.showError('รหัสผ่านไม่ถูกต้อง');
        this.pin = '';
        setTimeout(() => {
          this.updatePinDots();
          this.disablePinPad(false);
        }, 600);
      }
    } catch (error) {
      this.showError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      this.pin = '';
      setTimeout(() => {
        this.updatePinDots();
        this.disablePinPad(false);
      }, 600);
    } finally {
      this.showLoading(false);
    }
  },

  showSuccess() {
    this.pinDisplay.classList.add('success');
    this.clearError();
    
    // Add success message
    this.errorMessage.textContent = '✅ เข้าสู่ระบบสำเร็จ!';
    this.errorMessage.style.color = '#10b981';
    
    setTimeout(() => {
      this.pinDisplay.classList.remove('success');
    }, 1000);
  },

  disablePinPad(disabled) {
    const buttons = this.pinPad.querySelectorAll('.pin-btn');
    buttons.forEach(btn => {
      btn.disabled = disabled;
      btn.style.opacity = disabled ? '0.5' : '';
      btn.style.pointerEvents = disabled ? 'none' : '';
    });
  },

  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.style.color = '#fecaca';
    
    // Add shake animation
    this.pinDisplay.classList.add('shake');
    
    // Add error styling to dots
    const dots = this.pinDots.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].style.borderColor = '#ef4444';
      dots[i].style.background = 'rgba(239, 68, 68, 0.2)';
    }
    
    setTimeout(() => {
      this.pinDisplay.classList.remove('shake');
      
      // Reset dot styling
      for (let i = 0; i < dots.length; i++) {
        dots[i].style.borderColor = '';
        dots[i].style.background = '';
      }
    }, 600);
  },

  clearError() {
    this.errorMessage.textContent = '';
  },

  showLoading(isLoading) {
    if (isLoading) {
      this.loadingOverlay.style.display = 'flex';
      setTimeout(() => {
        this.loadingOverlay.style.opacity = '1';
      }, 10);
    } else {
      this.loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        this.loadingOverlay.style.display = 'none';
      }, 300);
    }
  }
};

loginView.init();