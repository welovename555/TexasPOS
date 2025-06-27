import { authStore } from './authStore.js';
const SHIFT_SESSION_KEY = 'shiftSession';

const shiftStore = {
  state: {
    currentShift: null,
    isActive: false
  },

  init() {
    const shiftSession = sessionStorage.getItem(SHIFT_SESSION_KEY);
    if (shiftSession) {
      this.state.currentShift = JSON.parse(shiftSession);
      this.state.isActive = true;
      return;
    }
    
    if (!this.state.isActive && authStore.state.isAuthenticated) {
      this.startMockShift();
    }
  },

  startMockShift() {
    const mockShift = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // ID จำลอง
      employee_id: authStore.state.user.id,
      start_time: new Date().toISOString()
    };
    this.state.currentShift = mockShift;
    this.state.isActive = true;
    sessionStorage.setItem(SHIFT_SESSION_KEY, JSON.stringify(mockShift));
  },

  clearShift() {
    this.state.currentShift = null;
    this.state.isActive = false;
    sessionStorage.removeItem(SHIFT_SESSION_KEY);
  }
};

shiftStore.init();

export { shiftStore };
