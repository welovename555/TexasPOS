import { supabaseClient } from '../config.js';
import { authStore } from '../stores/authStore.js';

const stockService = {
  /**
   * Add stock to a product
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to add
   * @param {string} note - Optional note
   * @returns {Object} - Success/error result
   */
  async addStock(productId, quantity, note = '') {
    try {
      console.log('📦 Adding stock:', { productId, quantity, note });

      // Use the increase_stock function
      const { data, error } = await supabaseClient.rpc('increase_stock', {
        p_product_id: productId,
        p_quantity_added: quantity
      });

      if (error) throw error;

      // Log the stock change (optional - you can create a stock_logs table for this)
      console.log('✅ Stock added successfully:', data);

      return { success: true, data };

    } catch (error) {
      console.error('❌ Error adding stock:', error);
      return { success: false, error };
    }
  },

  /**
   * Get stock history for a product (if you want to implement this later)
   * @param {string} productId - Product ID
   * @returns {Object} - Stock history data
   */
  async getStockHistory(productId) {
    try {
      // This would require a stock_logs table to track all stock changes
      // For now, we'll just return empty array
      return { success: true, data: [] };
    } catch (error) {
      console.error('❌ Error fetching stock history:', error);
      return { success: false, error };
    }
  }
};

export { stockService };