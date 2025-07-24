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
      // const shift_id = shiftStore.state.currentShift?.id; // ลบการอ้างอิง shiftStore
      console.log('🔍 Sale details:', { transaction_id, employee_id });

      if (!employee_id) { // เอา shift_id ออกจากเงื่อนไข
        throw new Error('ไม่พบข้อมูลพนักงานปัจจุบัน');
      }

      const salesRecords = cartItems.map(item => ({
        transaction_id,
        employee_id,
        shift_id: null, // กำหนดให้ shift_id เป็น null เสมอ
        product_id: item.product.id,
        quantity: item.quantity,
        price_per_unit: item.selectedPrice, // ใช้ราคาที่เลือก
        total_item_price: item.selectedPrice * item.quantity,
        payment_method: paymentMethod
      }));

      console.log('📊 Sales records to insert:', salesRecords);

      // Step 1: Insert all sale records into the 'sales' table.
      const { data, error: salesError } = await supabaseClient
        .from('sales')
        .insert(salesRecords)
        .select();

      if (salesError) {
        console.error('❌ Sales insert error:', salesError);
        throw salesError;
      }

      console.log('✅ Sales records inserted:', data);

      // Step 2: Update stock quantities for all sold products.
      await this._updateStock(cartItems);

      // Step 3: Notify the app that stock has changed.
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
      // สร้างเวลาเริ่มต้น 05:00 ของวันนั้น (เวลาไทย UTC+7)
      const start = new Date(`${date}T05:00:00+07:00`);
      
      // คำนวณเวลาสิ้นสุดคือ 24 ชั่วโมงถัดไป ลบออก 1 มิลลิวินาที
      const end = new Date(start.getTime() + (24 * 60 * 60 * 1000) - 1);

      // แปลงเป็นรูปแบบ ISO String (UTC) สำหรับ Supabase
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
