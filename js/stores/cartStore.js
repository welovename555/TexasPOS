const cartStore = {
  state: { items: [], total: 0 },

  // เพิ่ม item โดยรับราคาที่เลือกมาด้วย
  addItem(product, selectedPrice) {
    // หาสินค้าในตะกร้าที่ ID และ "ราคาที่เลือก" ตรงกัน
    const existingItem = this.state.items.find(item => 
      item.product.id === product.id && item.selectedPrice === selectedPrice
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.state.items.push({ 
        product: product, 
        quantity: 1, 
        selectedPrice: selectedPrice // เก็บราคาที่เลือกไว้กับ item
      });
    }
    this.updateTotal();
  },

  // ลบ item โดยต้องเช็คราคาด้วย
  removeItem(productId, selectedPrice) {
    const itemIndex = this.state.items.findIndex(item => 
      item.product.id === productId && item.selectedPrice === selectedPrice
    );
    
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

  updateTotal() {
    this.state.total = this.state.items.reduce(
      (sum, item) => sum + item.selectedPrice * item.quantity, 0
    );
    document.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.state }));
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
