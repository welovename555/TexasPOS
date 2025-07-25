import { supabaseClient } from '../config.js';
import { authStore } from '../stores/authStore.js';

const salesService = {
  /**
   * Updates the stock for each item in the cart by calling a database function.
   * @param {Array} cartItems - The items from the cart.
   */
  async _updateStock(cartItems) {
    console.log('📦 Updating stock for items:', cartItems);
    
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
        console.error('❌ Stock update failed:', result.error);
        throw new Error(`Failed to update stock: ${result.error.message}`);
      }
    }
    
    console.log('✅ Stock updated successfully');
  },

  /**
   * Records a sale transaction, including all items, and updates stock.
   * @param {Array} cartItems - The items from the cart.
   * @param {string} paymentMethod - The method of payment ('cash' or 'transfer').
   * @returns {Object} - An object indicating success or failure.
   */
  async createSale(cartItems, paymentMethod) {
    console.log('💰 Creating sale:', { cartItems, paymentMethod });
    
    try {
      const transaction_id = crypto.randomUUID();
      const employee_id = authStore.state.user?.id;

      console.log('🔍 Sale details:', { transaction_id, employee_id });

      if (!employee_id) {
        throw new Error('ไม่พบข้อมูลพนักงานปัจจุบัน');
      }

      const salesRecords = cartItems.map(item => ({
        transaction_id,
        employee_id,
        shift_id: null,
        product_id: item.product.id,
        quantity: item.quantity,
        price_per_unit: item.selectedPrice,
        total_item_price: item.selectedPrice * item.quantity,
        payment_method: paymentMethod
      }));

      console.log('📊 Sales records to insert:', salesRecords);

      const { data, error: salesError } = await supabaseClient
        .from('sales')
        .insert(salesRecords)
        .select();

      if (salesError) {
        console.error('❌ Sales insert error:', salesError);
        throw salesError;
      }

      console.log('✅ Sales records inserted:', data);

      await this._updateStock(cartItems);
      document.dispatchEvent(new CustomEvent('stockUpdated', { bubbles: true }));

      console.log('🎉 Sale completed successfully');
      return { success: true, data };

    } catch (error) {
      console.error('💥 Error in createSale process:', error);
      return { success: false, error };
    }
  },

  /**
   * Fetch sales history for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Object} - Sales data with summary
   */
  async getSalesHistory(date) {
    console.log('📊 Fetching sales history for date:', date);

    try {
      // ✅ ปรับช่วงเวลาให้เริ่มที่ 02:00 ของวันนั้น (UTC+7)
      const start = new Date(`${date}T02:00:00+07:00`);

      // ✅ จบที่ 01:59:59 ของวันถัดไป
      const end = new Date(start.getTime() + (24 * 60 * 60 * 1000) - 1);

      const startDate = start.toISOString();
      const endDate = end.toISOString();

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

      console.log('📈 Sales history fetched:', { salesData: salesData.length, summary });

      return {
        success: true,
        data: salesData,
        summary
      };

    } catch (error) {
      console.error('❌ Error fetching sales history:', error);
      return { success: false, error };
    }
  }
};

export { salesService };
