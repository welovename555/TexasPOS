import { getUserByCode } from './userService.js';
import { authStore } from '../stores/authStore.js';

export const login = async (employeeCode) => {
  const { user, error } = await getUserByCode(employeeCode);

  if (error || !user) {
    return { success: false, message: 'รหัสพนักงานไม่ถูกต้อง' };
  }

  authStore.setUser(user);
  window.location.href = 'pos.html';
  return { success: true, message: 'เข้าสู่ระบบสำเร็จ' };
};

export const logout = () => {
  authStore.clearUser();
  window.location.href = 'index.html';
};

export const checkLoginStatus = () => {
  return authStore.getUser();
};
