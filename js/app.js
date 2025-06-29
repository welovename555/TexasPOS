import { authStore } from './stores/authStore.js';
import { sellView } from './views/sellView.js';
import { historyView } from './views/historyView.js';
import { adminView } from './views/adminView.js';
import { priceSelectorModal } from './components/priceSelectorModal.js';
import { checkoutModal } from './components/checkoutModal.js';
import './stores/shiftStore.js';

const App = {
  currentView: 'sell-view',

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.handleAuthentication();
      this.addGlobalEventListeners();
      this.setupNavigation();
    });
  },

  addGlobalEventListeners() {
    // Event สำหรับเปิด Price Selector Modal
    window.addEventListener('openPriceSelector', (e) => {
      console.log('🎯 Event openPriceSelector received:', e.detail);
      const { product } = e.detail;
      if (product) {
        priceSelectorModal.open(product);
      }
    });

    // Event สำหรับเปิด Checkout Modal
    window.addEventListener('openCheckoutModal', () => {
      console.log('🛒 Event openCheckoutModal received');
      checkoutModal.open();
    });

    // Event สำหรับ debug cart updates
    document.addEventListener('cartUpdated', (e) => {
      console.log('🛍️ Cart updated:', e.detail);
    });
  },

  handleAuthentication() {
    if (!authStore.state.isAuthenticated) {
      window.location.href = 'index.html';
      return;
    }
    
    // Initialize default view
    sellView.init();
  },

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    const logoutBtn = document.getElementById('logout-btn');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const viewName = item.dataset.view;
        this.switchView(viewName, item);
      });
    });

    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  },

  switchView(viewName, navItem) {
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    navItem.classList.add('active');

    // Hide all views
    document.querySelectorAll('.content-view').forEach(view => {
      view.classList.remove('active');
    });

    // Show selected view
    const targetView = document.getElementById(viewName);
    if (targetView) {
      targetView.classList.add('active');
      this.currentView = viewName;

      // Initialize view if needed
      switch (viewName) {
        case 'history-view':
          historyView.init();
          break;
        case 'admin-view':
          adminView.init();
          break;
        case 'sell-view':
          // sellView is already initialized
          break;
      }
    }
  },

  logout() {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      authStore.logout();
      window.location.href = 'index.html';
    }
  }
};

App.init();