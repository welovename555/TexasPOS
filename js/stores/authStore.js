const authStore = {
  currentUser: null,
  setUser(user) {
    this.currentUser = user;
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));
  },
  getUser() {
    if (this.currentUser) {
      return this.currentUser;
    }
    const userFromSession = sessionStorage.getItem('loggedInUser');
    if (userFromSession) {
      this.currentUser = JSON.parse(userFromSession);
      return this.currentUser;
    }
    return null;
  },
  clearUser() {
    this.currentUser = null;
    sessionStorage.removeItem('loggedInUser');
  }
};
export { authStore };
