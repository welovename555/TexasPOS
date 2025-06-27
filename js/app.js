import { authStore } from './stores/authStore.js';
import { sellView } from './views/sellView.js';
import { priceSelectorModal } from './components/priceSelectorModal.js';
import { checkoutModal } from './components/checkoutModal.js'; // **เพิ่มบรรทัดนี้กลับเข้ามา**
import './stores/shiftStore.js';

const App = {
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.handleAuthentication();
      this.addGlobalEventListeners();
    });
  },

  addGlobalEventListeners() {
    window.addEventListener('openPriceSelector', (e) => {
      const { product } = e.detail;
      if (product) {
        priceSelectorModal.open(product);
      }
    });
  },

  handleAuthentication() {
    if (!authStore.state.isAuthenticated) {
      window.location.href = 'index.html';
      return;
    }
    
    sellView.init();
  }
};

App.init();
