const cartStore = (() => {
  const state = {
    items: []
  };

  const getItems = () => [...state.items];

  const addItem = (product, selectedPrice = null) => {
    const existingItem = state.items.find(item => item.product.id === product.id && item.selectedPrice === selectedPrice);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      state.items.push({ product, quantity: 1, selectedPrice });
    }
    saveToLocalStorage();
  };

  const removeItem = (productId, selectedPrice = null) => {
    state.items = state.items.filter(item => !(item.product.id === productId && item.selectedPrice === selectedPrice));
    saveToLocalStorage();
    document.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const increaseItemQuantity = (productId, selectedPrice = null) => {
    const item = state.items.find(item => item.product.id === productId && item.selectedPrice === selectedPrice);
    if (item) {
      item.quantity++;
      saveToLocalStorage();
      document.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  };

  const decreaseItemQuantity = (productId, selectedPrice = null) => {
    const item = state.items.find(item => item.product.id === productId && item.selectedPrice === selectedPrice);
    if (item && item.quantity > 1) {
      item.quantity--;
      saveToLocalStorage();
      document.dispatchEvent(new CustomEvent('cartUpdated'));
    } else if (item) {
      removeItem(productId, selectedPrice);
    }
  };

  const clearCart = () => {
    state.items = [];
    saveToLocalStorage();
    document.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const getTotal = () => {
    return state.items.reduce((total, item) => {
      const price = item.selectedPrice !== null ? item.selectedPrice : item.product.base_price;
      return total + price * item.quantity;
    }, 0);
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('cartItems', JSON.stringify(state.items));
  };

  const loadFromLocalStorage = () => {
    const storedItems = localStorage.getItem('cartItems');
    if (storedItems) {
      state.items = JSON.parse(storedItems);
    }
  };

  loadFromLocalStorage();

  return {
    getItems,
    addItem,
    removeItem,
    increaseItemQuantity,
    decreaseItemQuantity,
    clearCart,
    getTotal,
    getItemCount
  };
})();

export { cartStore };
