const cartStore = {
  state: {
    items: [],
    total: 0,
  },

  addItem(product) {
    // Logic will be implemented later
    console.log(`(cartStore) Adding item: ${product.name}`);
  },

  updateTotal() {
    // Logic will be implemented later
  },

  getCart() {
    return this.state;
  },

  clearCart() {
    this.state.items = [];
    this.state.total = 0;
    console.log('(cartStore) Cart cleared.');
  }
};
