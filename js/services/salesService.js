import { supabaseClient } from '../config.js';
import { authStore } from '../stores/authStore.js';
import { shiftStore } from '../stores/shiftStore.js';

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
        transaction_id,
        employee_id,
        shift_id,
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

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating sale:', error.message);
      return { success: false, error };
    }
  }
};

export { salesService };

// แก้ createSale โดยเพิ่มส่วนลด stock ต่อท้าย
async function createSale(cartItems, paymentMethod, paidAmount = null) {
  try {
    const total = cartItems.reduce((sum, item) => sum + (item.product.base_price * item.quantity), 0);

    const { data: sale, error } = await supabaseClient
      .from('sales')
      .insert([{
        items: cartItems.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          price: item.product.base_price,
          quantity: item.quantity
        })),
        total,
        payment_method: paymentMethod,
        paid_amount: paidAmount
      }])
      .select()
      .single();

    if (error) throw error;

    // ✅ ตัด stock สินค้าทันที
    await updateStockAfterSale(cartItems);

    return sale;
  } catch (error) {
    console.error('Sale Error:', error.message);
    return null;
  }
}

async function updateStockAfterSale(cartItems) {
  try {
    const updates = cartItems.map(item => ({
      id: item.product.id,
      stock_quantity: item.product.stock_quantity - item.quantity
    }));

    const { error } = await supabaseClient
      .from('products')
      .upsert(updates, { onConflict: ['id'] });

    if (error) throw error;

    document.dispatchEvent(new CustomEvent('stockUpdated'));
    return true;
  } catch (err) {
    console.error('Stock update error:', err.message);
    return false;
  }
}
