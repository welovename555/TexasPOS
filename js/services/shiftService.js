import { supabaseClient } from '../config.js';

const shiftService = {
  async getActiveShift(employeeId) {
    try {
      // แก้ไขโค้ดโดยการเอา .single() ออก
      const { data, error } = await supabaseClient
        .from('shifts')
        .select('*')
        .eq('employee_id', employeeId)
        .is('end_time', null);

      if (error) {
        throw error;
      }

      // เนื่องจากตอนนี้ data จะเป็น Array เสมอ (เช่น [] หรือ [{...}])
      // เราจึงต้องเช็คเองว่ามีข้อมูลหรือไม่ แล้วส่งค่าแรกกลับไป
      return data && data.length > 0 ? data[0] : null;

    } catch (error) {
      console.error('Error getting active shift:', error.message);
      return null;
    }
  },

  async startShift(employeeId) {
    try {
      // แก้ไขโค้ดโดยการเอา .single() ออก
      const { data, error } = await supabaseClient
        .from('shifts')
        .insert({
          employee_id: employeeId,
          start_time: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      // เพิ่มการตรวจสอบและคืนค่าเป็น object แรกของ Array
      return data && data.length > 0 ? data[0] : null;

    } catch (error) {
      console.error('Error starting shift:', error.message);
      return null;
    }
  },

  async endShift(shiftId, summary) {
    try {
        // แก้ไขโค้ดโดยการเอา .single() ออก
        const { data, error } = await supabaseClient
            .from('shifts')
            .update({
                end_time: new Date().toISOString(),
                cash_total: summary.cash,
                transfer_total: summary.transfer,
                summary_totals: summary.totals // สมมติว่ามีคอลัมน์นี้สำหรับเก็บยอดรวมทั้งหมด
            })
            .eq('id', shiftId)
            .select();

        if (error) throw error;
        
        // เพิ่มการตรวจสอบและคืนค่าเป็น object แรกของ Array
        return data && data.length > 0 ? data[0] : null;

    } catch (error) {
        console.error('Error ending shift:', error.message);
        return null;
    }
  }
};

export { shiftService };
