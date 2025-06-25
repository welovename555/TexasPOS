// --- User Service ---
// หน้าที่: จัดการเกี่ยวกับการดึงข้อมูลผู้ใช้จากฐานข้อมูล

// 1. Import Supabase client จากไฟล์ config
// เราต้องใช้ '..' เพื่อถอยกลับไปหนึ่งระดับก่อนจะเข้าโฟลเดอร์ js
import { supabase } from '../config.js';

/**
 * ดึงข้อมูลผู้ใช้จากฐานข้อมูลด้วยรหัสพนักงาน (code)
 * @param {string} employeeCode - รหัสพนักงาน 4 หลักที่ต้องการค้นหา
 * @returns {Promise<{user: object|null, error: object|null}>} - Object ที่มีข้อมูล user หรือ error
 */
export const getUserByCode = async (employeeCode) => {
  try {
    [span_0](start_span)// 2. ค้นหาข้อมูลในตาราง 'employees'[span_0](end_span)
    [span_1](start_span)// โดยใช้เงื่อนไขว่า 'code' ต้องตรงกับที่รับเข้ามา[span_1](end_span)
    // .single() คือการบอกว่าเราต้องการข้อมูลแค่แถวเดียว ถ้าเจอมากกว่า 1 หรือไม่เจอเลยจะเกิด error
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('code', employeeCode)
      .single();

    // 3. ตรวจสอบว่ามี error จากการ query หรือไม่
    if (error) {
      // ถ้ามี error (เช่น ไม่เจอ user ที่มี code นี้) ให้โยน error ออกไป
      throw error;
    }

    // 4. ถ้าสำเร็จ คืนค่าข้อมูล user กลับไป
    return { user: data, error: null };

  } catch (error) {
    // 5. จัดการ error ที่อาจเกิดขึ้น (เช่น Network error หรือหา user ไม่เจอ)
    console.error('Error fetching user by code:', error.message);
    return { user: null, error: error };
  }
};
