const salesService = {
  async createSale(cartItems, paymentMethod) {
    try {
      const transaction_id = crypto.randomUUID();
      const employee_id = authStore.state.user.id;
      const shift_id = shiftStore.state.currentShift.id;

      if (!employee_id || !shift_id) {
        throw new Error('ไม่พบข้อมูลพนักงานหรือข้อมูลกะปัจจุบัน');
      }

      const salesData = cartItems.map(item => ({
        transaction_id: transaction_id,
        employee_id: employee_id,
        shift_id: shift_id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_per_unit: item.product.base_price,
        total_item_price: item.product.base_price * item.quantity,
        payment_method: paymentMethod
      }));

      const { data, error } = await supabaseClient
        .from('sales')
        .insert(salesData)
        .select();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error creating sale:', error.message);
      return { success: false, error };
    }
  }
};
