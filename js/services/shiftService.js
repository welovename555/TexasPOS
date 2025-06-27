import { supabaseClient } from '../config.js';
import { authStore } from '../stores/authStore.js'; // **เพิ่ม import ที่จำเป็น**

const shiftService = {
  async getActiveShift(employeeId) {
    try {
      const { data, error } = await supabaseClient
        .from('shifts')
        .select('*')
        .eq('employee_id', employeeId)
        .is('end_time', null);

      if (error) {
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;

    } catch (error) {
      console.error('Error getting active shift:', error.message);
      return null;
    }
  },

  async startShift(employeeId) {
    try {
      // **(การแก้ไขครั้งสุดท้าย)**
      // เอา .select() ออก ให้เหลือแค่ .insert()
      // เพื่อสั่ง "สร้าง" อย่างเดียว ไม่ต้องรอ "ข้อมูลตอบกลับ"
      const { error } = await supabaseClient
        .from('shifts')
        .insert({
          employee_id: employeeId,
          start_time: new Date().toISOString()
        });

      if (error) throw error;
      
      // **(การแก้ไขครั้งสุดท้าย)**
      // เมื่อไม่ .select() เราจะไม่มี data กลับมา
      // ดังนั้นเราจะ return true เพื่อบอกว่าคำสั่งสำเร็จแล้ว
      return true;

    } catch (error) {
      console.error('Error starting shift:', error.message);
      return false; // **เปลี่ยนเป็น false เมื่อเกิด Error**
    }
  },

  async endShift(shiftId, summary) {
    try {
        const { data, error } = await supabaseClient
            .from('shifts')
            .update({
                end_time: new Date().toISOString(),
                cash_total: summary.cash,
                transfer_total: summary.transfer,
                summary_totals: summary.totals
            })
            .eq('id', shiftId)
            .select();

        if (error) throw error;
        
        return data && data.length > 0 ? data[0] : null;

    } catch (error) {
        console.error('Error ending shift:', error.message);
        return null;
    }
  }
};

export { shiftService };
