import { userService } from './userService.js';
import { authStore } from '../stores/authStore.js';

const authService = {
  async login(pinCode) {
    const user = await userService.findUserByCode(pinCode);
    if (user) {
      authStore.login(user);
      return true;
    }
    return false;
  },

  logout() {
    authStore.logout();
    window.location.href = 'index.html';
  }
};

export { authService };
