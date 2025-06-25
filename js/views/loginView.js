// --- Login View ---
// หน้าที่: จัดการ Logic ที่เกี่ยวข้องกับ UI ของหน้า Login (index.html)
// เช่น การรับข้อมูลจากฟอร์ม, การแสดงข้อความ error, และการเรียกใช้ authService

// 1. Import ฟังก์ชัน login จาก authService
import { login } from '../services/authService.js';

// 2. รอให้ HTML โหลดเสร็จก่อนเริ่มทำงานกับ DOM
document.addEventListener('DOMContentLoaded', () => {

  // 3. ดึง Element ที่ต้องใช้จากหน้า HTML
  const loginForm = document.getElementById('login-form');
  const employeeCodeInput = document.getElementById('employee-code');
  const loginButton = document.getElementById('login-button');
  const errorMessageElement = document.getElementById('error-message');
  const buttonText = loginButton.querySelector('.button-text');
  const spinner = loginButton.querySelector('.spinner');

  // 4. สร้างฟังก์ชันสำหรับจัดการสถานะ Loading ของปุ่ม
  const setLoadingState = (isLoading) => {
    if (isLoading) {
      loginButton.disabled = true;
      buttonText.style.display = 'none';
      spinner.style.display = 'block';
    } else {
      loginButton.disabled = false;
      buttonText.style.display = 'block';
      spinner.style.display = 'none';
    }
  };

  // 5. ดักจับเหตุการณ์การกด "Submit" ของฟอร์ม
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // ป้องกันไม่ให้หน้าเว็บโหลดใหม่
    
    // 6. เริ่มสถานะ Loading และล้างข้อความ error เก่า
    setLoadingState(true);
    errorMessageElement.textContent = '';
    
    // 7. ดึงค่ารหัสพนักงานจากช่อง input
    const employeeCode = employeeCodeInput.value;

    // 8. ตรวจสอบข้อมูลเบื้องต้น
    if (employeeCode.length !== 4) {
      errorMessageElement.textContent = 'กรุณากรอกรหัสพนักงาน 4 หลักให้ถูกต้อง';
      setLoadingState(false);
      return; // หยุดการทำงาน
    }

    // 9. เรียกใช้ฟังก์ชัน login จาก authService
    const result = await login(employeeCode);

    // 10. หากการ Login ล้มเหลว (success === false)
    if (!result.success) {
      // แสดงข้อความ error ที่ได้จาก service
      errorMessageElement.textContent = result.message;
      
      // คืนสถานะปุ่มกลับเป็นปกติ
      setLoadingState(false);
      
      // ล้างช่อง input เพื่อให้ผู้ใช้กรอกใหม่
      employeeCodeInput.value = '';
      employeeCodeInput.focus();
    }
    // หากสำเร็จ (success === true), authService จะ redirect ไปหน้า pos.html เอง
  });
});
