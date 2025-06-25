// --- Authentication Service ---
[span_0](start_span)// หน้าที่: จัดการกระบวนการ Login/Logout[span_0](end_span)

// 1. Import โมดูลที่จำเป็น
import { getUserByCode } from './userService.js'; // ฟังก์ชันค้นหา user
import { authStore } from '../stores/authStore.js'; // ที่เก็บข้อมูล user

/**
 * ฟังก์ชันสำหรับจัดการการ Login
 * @param {string} employeeCode - รหัสพนักงาน 4 หลักที่รับจาก input
 * @returns {Promise<{success: boolean, message: string}>} - ผลลัพธ์การ Login
 */
export const login = async (employeeCode) => {
  // 2. เรียกใช้ userService เพื่อค้นหาพนักงานด้วยรหัสที่กรอกเข้ามา
  const { user, error } = await getUserByCode(employeeCode);

  // 3. ตรวจสอบผลลัพธ์
  if (error || !user) {
    // หากมี error หรือไม่พบ user ให้ trả về สถานะล้มเหลว
    return { success: false, message: 'รหัสพนักงานไม่ถูกต้อง' };
  }

  // 4. หากพบ user (Login สำเร็จ)
  // บันทึกข้อมูล user ลงใน authStore
  authStore.setUser(user);

  // ส่งต่อไปยังหน้า POS หลัก
  window.location.href = 'pos.html';

  // คืนค่าสถานะสำเร็จ
  return { success: true, message: 'เข้าสู่ระบบสำเร็จ' };
};

/**
 * ฟังก์ชันสำหรับจัดการการ Logout
 */
export const logout = () => {
  // 1. ล้างข้อมูลผู้ใช้ออกจาก authStore และ sessionStorage
  authStore.clearUser();
  // 2. ส่งกลับไปยังหน้า Login
  window.location.href = 'index.html';
};

/**
 * ฟังก์ชันสำหรับตรวจสอบสถานะการ Login ปัจจุบัน
 * @returns {object|null} ข้อมูลผู้ใช้ที่ล็อกอินอยู่ หรือ null
 */
export const checkLoginStatus = () => {
  return authStore.getUser();
};
