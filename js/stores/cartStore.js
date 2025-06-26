const cartStore = {
  state: { items: [], total: 0 },

  addItem(product) {
    const existingItem = this.state.items.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.state.items.push({ product: product, quantity: 1 });
    }
    this.updateTotal();
  },

  removeItem(productId) {
    const itemIndex = this.state.items.findIndex(item => item.product.id === productId);
    if (itemIndex > -1) {
      const item = this.state.items[itemIndex];
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        this.state.items.splice(itemIndex, 1);
      }
      this.updateTotal();
    }
  },

  updateQuantity(productId, quantity) {
    const item = this.state.items.find(item => item.product.id === productId);
    if (item) {
      item.quantity = quantity;
      this.updateTotal();
    }
  },

  updateTotal() {
    this.state.total = this.state.items.reduce(
      (sum, item) => sum + item.product.base_price * item.quantity, 0
    );
    document.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.state }));
  },

  getCart() {
    return this.state;
  },

  getItems() {
    return [...this.state.items];
  },

  getTotal() {
    return this.state.total;
  },

  clearCart() {
    this.state.items = [];
    this.state.total = 0;
    document.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.state }));
  }
};

export { cartStore };
