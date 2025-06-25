// --- Login View (PIN Pad Version) ---
// หน้าที่: จัดการ Logic ที่เกี่ยวข้องกับ UI ของหน้า Login แบบ PIN Pad

// 1. Import ฟังก์ชันที่จำเป็น
import { login } from '../services/authService.js';

// 2. รอให้ HTML โหลดเสร็จก่อนเริ่มทำงาน
document.addEventListener('DOMContentLoaded', () => {

  // 3. ดึง Element ที่ต้องใช้จากหน้า HTML
  const keypad = document.getElementById('keypad');
  const pinDisplay = document.getElementById('pin-display');
  const pinDots = pinDisplay.querySelectorAll('.pin-dot');
  const errorMessageElement = document.getElementById('error-message');
  const spinnerOverlay = document.getElementById('spinner-overlay');

  let currentPin = ''; // ตัวแปรสำหรับเก็บค่า PIN ที่ผู้ใช้กด

  // 4. Helper Functions (ฟังก์ชันตัวช่วย)
  
  /** อัปเดตการแสดงผลของจุด PIN */
  const updatePinDisplay = () => {
    pinDots.forEach((dot, index) => {
      if (index < currentPin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  };

  /** แสดง/ซ่อน Spinner แบบเต็มจอ */
  const showSpinner = (show) => {
    if (show) {
      spinnerOverlay.classList.remove('hidden');
      spinnerOverlay.style.opacity = '1'; // เริ่ม Fade-in
    } else {
      spinnerOverlay.style.opacity = '0'; // เริ่ม Fade-out
      // รอให้ animation fade-out จบก่อนซ่อน element จริงๆ
      setTimeout(() => {
        spinnerOverlay.classList.add('hidden');
      }, 300); // 300ms คือค่า --transition-speed ใน base.css
    }
  };
  
  /** ลองทำการ Login */
  const attemptLogin = async () => {
    showSpinner(true);
    const result = await login(currentPin);
    showSpinner(false);

    if (!result.success) {
      errorMessageElement.textContent = result.message;
      // เพิ่ม animation สั่นเพื่อแจ้งเตือนผู้ใช้
      pinDisplay.classList.add('shake');
      
      // ล้างค่า PIN หลังจาก Login ผิดพลาด
      currentPin = '';
      
      // รอให้ animation สั่นจบแล้วค่อยล้างจุด PIN และเอา class สั่นออก
      setTimeout(() => {
        updatePinDisplay();
        pinDisplay.classList.remove('shake');
      }, 500);
    }
    // หากสำเร็จ authService จะ redirect ไปเอง
  };

  // 5. เพิ่ม Event Listener ที่ Keypad (ใช้ Event Delegation)
  keypad.addEventListener('click', (event) => {
    const button = event.target.closest('.keypad-button');
    if (!button) return; // ถ้าที่คลิกไม่ใช่ปุ่ม ให้หยุด

    errorMessageElement.textContent = ''; // ล้าง error เก่าทุกครั้งที่กด
    const key = button.dataset.key;

    if (key === 'backspace') {
      currentPin = currentPin.slice(0, -1);
    } else if (currentPin.length < 4) {
      currentPin += key;
    }

    updatePinDisplay();

    // ถ้า PIN ครบ 4 หลัก ให้ทำการ Login ทันที
    if (currentPin.length === 4) {
      attemptLogin();
    }
  });
});
