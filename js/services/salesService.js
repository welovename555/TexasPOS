import { supabaseClient } from '../config.js';
import { authStore } from '../stores/authStore.js';
import { shiftStore } from '../stores/shiftStore.js';

const salesService = {
  /**
   * Updates the stock for each item in the cart by calling a database function.
   * @param {Array} cartItems - The items from the cart.
   */
  async _updateStock(cartItems) {
    const stockUpdatePromises = cartItems.map(item =>
      supabaseClient.rpc('decrease_stock', {
        p_product_id: item.product.id,
        p_quantity_sold: item.quantity
      })
    );

    const results = await Promise.all(stockUpdatePromises);

    // Check if any of the stock updates failed
    for (const result of results) {
      if (result.error) {
        // We throw an error here to be caught by the calling function.
        // This allows us to potentially handle a rollback or notify the user.
        throw new Error(`Failed to update stock: ${result.error.message}`);
      }
    }
  },

  /**
   * Records a sale transaction, including all items, and updates stock.
   * @param {Array} cartItems - The items from the cart.
   * @param {string} paymentMethod - The method of payment ('cash' or 'transfer').
   * @returns {Object} - An object indicating success or failure.
   */
  async createSale(cartItems, paymentMethod) {
    try {
      const transaction_id = crypto.randomUUID();
      const employee_id = authStore.state.user?.id;
      const shift_id = shiftStore.state.currentShift?.id;

      if (!employee_id || !shift_id) {
        throw new Error('ไม่พบข้อมูลพนักงานหรือข้อมูลกะปัจจุบัน');
      }

      const salesRecords = cartItems.map(item => ({
        transaction_id,
        employee_id,
        shift_id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_per_unit: item.product.base_price,
        total_item_price: item.product.base_price * item.quantity,
        payment_method: paymentMethod
      }));

      // Step 1: Insert all sale records into the 'sales' table.
      const { data, error: salesError } = await supabaseClient
        .from('sales')
        .insert(salesRecords)
        .select();

      if (salesError) {
        throw salesError;
      }

      // Step 2: Update stock quantities for all sold products.
      await this._updateStock(cartItems);

      // Step 3: Notify the app that stock has changed.
      document.dispatchEvent(new CustomEvent('stockUpdated'));

      return { success: true, data };

    } catch (error) {
      console.error('Error in createSale process:', error.message);
      return { success: false, error };
    }
  }
};

export { salesService };
