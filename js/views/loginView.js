import { login } from '../services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
  const keypad = document.getElementById('keypad');
  const pinDisplay = document.getElementById('pin-display');
  const pinDots = pinDisplay.querySelectorAll('.pin-dot');
  const errorMessageElement = document.getElementById('error-message');
  const spinnerOverlay = document.getElementById('spinner-overlay');

  let currentPin = '';

  const updatePinDisplay = () => {
    pinDots.forEach((dot, index) => {
      if (index < currentPin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  };

  const showSpinner = (show) => {
    if (show) {
      spinnerOverlay.classList.remove('hidden');
      spinnerOverlay.style.opacity = '1';
    } else {
      spinnerOverlay.style.opacity = '0';
      setTimeout(() => {
        spinnerOverlay.classList.add('hidden');
      }, 300);
    }
  };
  
  const attemptLogin = async () => {
    showSpinner(true);
    const result = await login(currentPin);
    showSpinner(false);

    if (!result.success) {
      errorMessageElement.textContent = result.message;
      pinDisplay.classList.add('shake');
      
      currentPin = '';
      
      setTimeout(() => {
        updatePinDisplay();
        pinDisplay.classList.remove('shake');
      }, 500);
    }
  };

  keypad.addEventListener('click', (event) => {
    const button = event.target.closest('.keypad-button');
    if (!button) return;

    errorMessageElement.textContent = '';
    const key = button.dataset.key;

    if (key === 'backspace') {
      currentPin = currentPin.slice(0, -1);
    } else if (currentPin.length < 4) {
      currentPin += key;
    }

    updatePinDisplay();

    if (currentPin.length === 4) {
      attemptLogin();
    }
  });
});
