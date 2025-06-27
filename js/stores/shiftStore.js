const SHIFT_SESSION_KEY = 'shiftSession';

const shiftStore = {
  state: {
    currentShift: null,
    isActive: false
  },

  init() {
    const shiftSession = sessionStorage.getItem(SHIFT_SESSION_KEY);
    console.log('[DEBUG] shiftStore.init(): Found session data:', shiftSession);
    if (shiftSession) {
      this.state.currentShift = JSON.parse(shiftSession);
      this.state.isActive = true;
      console.log('[DEBUG] shiftStore.init(): State updated. isActive:', this.state.isActive);
    } else {
      console.log('[DEBUG] shiftStore.init(): No session data found.');
    }
  },

  setShift(shiftData) {
    console.log('[DEBUG] shiftStore.setShift(): Setting new shift data:', shiftData);
    this.state.currentShift = shiftData;
    this.state.isActive = true;
    sessionStorage.setItem(SHIFT_SESSION_KEY, JSON.stringify(shiftData));
    console.log('[DEBUG] shiftStore.setShift(): Data saved to sessionStorage.');
  },

  clearShift() {
    this.state.currentShift = null;
    this.state.isActive = false;
    sessionStorage.removeItem(SHIFT_SESSION_KEY);
  }
};

shiftStore.init();

export { shiftStore };
