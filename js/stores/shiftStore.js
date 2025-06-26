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
    }
  },

  setShift(shiftData) {
    this.state.currentShift = shiftData;
    this.state.isActive = true;
    sessionStorage.setItem(SHIFT_SESSION_KEY, JSON.stringify(shiftData));
  },

  clearShift() {
    this.state.currentShift = null;
    this.state.isActive = false;
    sessionStorage.removeItem(SHIFT_SESSION_KEY);
  }
};

shiftStore.init();

export { shiftStore };
