import { authStore } from './stores/authStore.js';
import { sellView } from './views/sellView.js';
import { priceSelectorModal } from './components/priceSelectorModal.js';
import './stores/shiftStore.js'; // **แก้ไข: import เพื่อให้ shiftStore.init() ทำงาน**

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
    
    // ไม่มีการตรวจสอบกะอีกต่อไป เริ่มหน้าขายของทันที
    sellView.init();
  }
};

App.init();
