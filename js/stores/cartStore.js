const cartStore = {
  state: { items: [], total: 0 },

  // เพิ่ม item โดยรับราคาที่เลือกมาด้วย
  addItem(product, selectedPrice) {
    console.log('🛒 Adding item to cart:', product.name, 'Price:', selectedPrice);
    
    // หาสินค้าในตะกร้าที่ ID และ "ราคาที่เลือก" ตรงกัน
    const existingItem = this.state.items.find(item => 
      item.product.id === product.id && item.selectedPrice === selectedPrice
    );

    if (existingItem) {
      existingItem.quantity++;
      console.log('📈 Increased quantity for existing item:', existingItem);
    } else {
      const newItem = { 
        product: product, 
        quantity: 1, 
        selectedPrice: selectedPrice // เก็บราคาที่เลือกไว้กับ item
      };
      this.state.items.push(newItem);
      console.log('➕ Added new item to cart:', newItem);
    }
    this.updateTotal();
  },

  // ลบ item โดยต้องเช็คราคาด้วย
  removeItem(productId, selectedPrice) {
    console.log('🗑️ Removing item from cart:', productId, 'Price:', selectedPrice);
    
    const itemIndex = this.state.items.findIndex(item => 
      item.product.id === productId && item.selectedPrice === selectedPrice
    );
    
    if (itemIndex > -1) {
      const item = this.state.items[itemIndex];
      if (item.quantity > 1) {
        item.quantity--;
        console.log('📉 Decreased quantity:', item);
      } else {
        this.state.items.splice(itemIndex, 1);
        console.log('❌ Removed item completely');
      }
      this.updateTotal();
    }
  },

  updateTotal() {
    this.state.total = this.state.items.reduce(
      (sum, item) => sum + item.selectedPrice * item.quantity, 0
    );
    
    console.log('💰 Cart total updated:', this.state.total);
    console.log('🛍️ Current cart items:', this.state.items);
    
    document.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: this.state,
      bubbles: true 
    }));
  },

  getItems() {
    return [...this.state.items];
  },

  getTotal() {
    return this.state.total;
  },

  clearCart() {
    console.log('🧹 Clearing cart');
    this.state.items = [];
    this.state.total = 0;
    document.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: this.state,
      bubbles: true 
    }));
  }
};

export { cartStore };