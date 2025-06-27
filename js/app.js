import { authStore } from './stores/authStore.js';
import { shiftStore } from './stores/shiftStore.js';
import { shiftService } from './services/shiftService.js';
import { Modal } from './components/modal.js';
import { sellView } from './views/sellView.js';
import { priceSelectorModal } from './components/priceSelectorModal.js';
import { Spinner } from './components/spinner.js';

const App = {
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[DEBUG] App: DOMContentLoaded');
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

  async handleAuthentication() {
    console.log('[DEBUG] App: handleAuthentication started.');
    if (!authStore.state.isAuthenticated) {
      console.log('[DEBUG] App: User not authenticated. Redirecting to login.');
      window.location.href = 'index.html';
      return;
    }
    
    const mainContent = document.querySelector('.main-content');
    mainContent.style.visibility = 'hidden';
    Spinner.show();

    await this.checkAndStartShift();

    Spinner.hide();
    mainContent.style.visibility = 'visible';
    
    console.log('[DEBUG] App: Shift confirmed. Initializing sellView.');
    sellView.init();
  },

  async checkAndStartShift() {
    console.log('[DEBUG] App: checkAndStartShift started. Current shiftStore.state.isActive:', shiftStore.state.isActive);
    if (shiftStore.state.isActive) {
      console.log('[DEBUG] App: Shift is already active in store. Skipping checks.');
      return;
    }

    const employeeId = authStore.state.user.id;
    console.log('[DEBUG] App: No active shift in store. Checking DB for employeeId:', employeeId);
    const activeShift = await shiftService.getActiveShift(employeeId);
    console.log('[DEBUG] App: Fetched active shift from DB:', activeShift);

    if (activeShift) {
      shiftStore.setShift(activeShift);
    } else {
      console.log('[DEBUG] App: No active shift in DB. Prompting to start a new one.');
      await this.promptToStartShift(employeeId);
    }
  },

  promptToStartShift(employeeId) {
    return new Promise(resolve => {
      const modal = Modal.create({
        title: 'เริ่มต้นการทำงาน',
        body: '<p>ไม่พบกะที่เปิดใช้งานอยู่ คุณต้องการเริ่มกะใหม่หรือไม่?</p>',
        footer: '<button class="btn-confirm" id="confirm-start-shift">ยืนยันเริ่มกะ</button>',
        canClose: false
      });

      const confirmBtn = document.getElementById('confirm-start-shift');
      confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'กำลังเริ่ม...';

        const newShift = await shiftService.startShift(employeeId);
        if (newShift) {
          shiftStore.setShift(newShift);
          modal.close();
          resolve();
        } else {
          alert('เกิดข้อผิดพลาดในการเริ่มกะ กรุณาลองอีกครั้ง');
          confirmBtn.disabled = false;
          confirmBtn.textContent = 'ยืนยันเริ่มกะ';
        }
      });
    });
  }
};

App.init();
