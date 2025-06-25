// --- Auth Store ---
[span_0](start_span)// หน้าที่: จัดการสถานะ (State) ของผู้ใช้ที่กำลังล็อกอิน[span_0](end_span)
// ใช้เป็นที่เก็บข้อมูลส่วนกลางเพื่อให้ส่วนอื่นๆ ของแอปสามารถเข้าถึงได้

// 1. สร้าง Store object
// เราจะใช้ object ง่ายๆ ในการจัดการ state
const authStore = {
  // currentUser จะเก็บข้อมูล object ของผู้ใช้ที่ล็อกอินสำเร็จแล้ว
  currentUser: null,

  /**
   * บันทึกข้อมูลผู้ใช้ที่ล็อกอิน ทั้งใน memory และ sessionStorage
   * @param {object} user - ข้อมูลผู้ใช้ที่ได้มาจาก Supabase
   */
  setUser(user) {
    this.currentUser = user;
    // ใช้ sessionStorage เพื่อเก็บข้อมูล user ในรูปแบบ JSON string
    // ข้อมูลจะหายไปเมื่อปิดแท็บเบราว์เซอร์
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));
  },

  /**
   * ดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่
   * @returns {object|null} - ข้อมูลผู้ใช้ หรือ null ถ้าไม่มี
   */
  getUser() {
    // ถ้าใน memory มีข้อมูลอยู่แล้ว ให้ใช้ข้อมูลนั้นได้เลย
    if (this.currentUser) {
      return this.currentUser;
    }
    
    // ถ้าใน memory ไม่มี (เช่น เกิดการรีเฟรชหน้า) ให้ลองดึงจาก sessionStorage
    const userFromSession = sessionStorage.getItem('loggedInUser');
    if (userFromSession) {
      this.currentUser = JSON.parse(userFromSession);
      return this.currentUser;
    }

    // ถ้าไม่มีทั้งใน memory และ session
    return null;
  },

  /**
   * ล้างข้อมูลผู้ใช้ออกจากระบบ (Logout)
   */
  clearUser() {
    this.currentUser = null;
    sessionStorage.removeItem('loggedInUser');
  }
};

// 2. Export store เพื่อให้ไฟล์อื่น import ไปใช้ได้
export { authStore };
