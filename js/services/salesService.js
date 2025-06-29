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
        price_per_unit: item.selectedPrice, // ใช้ราคาที่เลือก
        total_item_price: item.selectedPrice * item.quantity,
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
  },

  /**
   * Fetch sales history for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Object} - Sales data with summary
   */
  async getSalesHistory(date) {
    try {
      const startDate = `${date}T00:00:00.000Z`;
      const endDate = `${date}T23:59:59.999Z`;

      const { data: salesData, error } = await supabaseClient
        .from('sales')
        .select(`
          *,
          products (name),
          employees (name)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate summary
      const summary = {
        totalSales: salesData.length,
        totalAmount: salesData.reduce((sum, sale) => sum + sale.total_item_price, 0),
        cashAmount: salesData
          .filter(sale => sale.payment_method === 'cash')
          .reduce((sum, sale) => sum + sale.total_item_price, 0),
        transferAmount: salesData
          .filter(sale => sale.payment_method === 'transfer')
          .reduce((sum, sale) => sum + sale.total_item_price, 0)
      };

      return { 
        success: true, 
        data: salesData,
        summary 
      };

    } catch (error) {
      console.error('Error fetching sales history:', error.message);
      return { success: false, error };
    }
  }
};

export { salesService };