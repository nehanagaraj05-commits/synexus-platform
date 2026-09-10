/* ========================================== */
/* store.js: Global State Management Engine   */
/* ========================================== */

class StateStore {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(newStatePayload) {
    this.state = { ...this.state, ...newStatePayload };
    console.log("🔄 Global State Updated:", this.state);
    this.listeners.forEach((listenerCallback) => {
      listenerCallback(this.state);
    });
  }

  subscribe(listenerCallback) {
    this.listeners.push(listenerCallback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listenerCallback);
    };
  }
}

export const globalStore = new StateStore({
  cartCount: 0,
  activeUser: null,
  isDarkMode: false,
});
