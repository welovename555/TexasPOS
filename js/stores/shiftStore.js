import { authStore } from './authStore.js';
const shiftStore = {
    state: { currentShift: null, isActive: false },
    startMockShift() {
        if (!this.state.currentShift && authStore.state.isAuthenticated) {
            this.state.currentShift = {
                id: 'b2e1f3a9-1b9a-4b0e-9c1a-2d3e4f5a6b7c',
                employee_id: authStore.state.user.id,
                start_time: new Date().toISOString()
            };
            this.state.isActive = true;
        }
    }
};
shiftStore.startMockShift();
export { shiftStore };
