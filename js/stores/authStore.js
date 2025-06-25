const authStore = {
  state: {
    user: null,
    isAuthenticated: false
  },

  init() {
    const userSession = sessionStorage.getItem('userSession');
    if (userSession) {
      this.state.user = JSON.parse(userSession);
      this.state.isAuthenticated = true;
    }
  },

  login(userData) {
    this.state.user = userData;
    this.state.isAuthenticated = true;
    sessionStorage.setItem('userSession', JSON.stringify(userData));
  },

  logout() {
    this.state.user = null;
    this.state.isAuthenticated = false;
    sessionStorage.removeItem('userSession');
  }
};

authStore.init();
