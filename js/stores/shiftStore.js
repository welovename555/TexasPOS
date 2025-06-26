import { authStore } from './authStore.js';

const SHIFT_SESSION_KEY = 'shiftSession';

const shiftStore = {
  state: {
    currentShift: null,
    isActive: false
  },

  init() {
    // พยายามโหลดกะจาก sessionStorage ก่อน
    const shiftSession = sessionStorage.getItem(SHIFT_SESSION_KEY);
    if (shiftSession) {
      this.state.currentShift = JSON.parse(shiftSession);
      this.state.isActive = true;
      return;
    }
    
    // ถ้าไม่มี session และ user เข้าระบบแล้ว ให้สร้างกะจำลองขึ้นมา
    if (!this.state.isActive && authStore.state.isAuthenticated) {
      this.startMockShift();
    }
  },

  startMockShift() {
    const mockShift = {
      // ใช้ ID จำลองเพื่อให้ทดสอบได้
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      employee_id: authStore.state.user.id,
      start_time: new Date().toISOString()
    };
    this.state.currentShift = mockShift;
    this.state.isActive = true;
    // บันทึกกะจำลองลง sessionStorage
    sessionStorage.setItem(SHIFT_SESSION_KEY, JSON.stringify(mockShift));
  },

  endShift() {
    this.state.currentShift = null;
    this.state.isActive = false;
    sessionStorage.removeItem(SHIFT_SESSION_KEY);
  }
};

// เรียก init() เพื่อให้ store เริ่มทำงานทันทีที่โหลด
shiftStore.init();

export { shiftStore };
