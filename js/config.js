// --- JS Configuration (ค่าคงที่และ Supabase URL/Key) ---
// ไฟล์นี้ใช้สำหรับเก็บข้อมูลการเชื่อมต่อกับ Supabase
// และสร้าง Supabase client เพื่อให้ไฟล์อื่นๆ สามารถนำไปใช้งานต่อได้

[span_0](start_span)// 1. ดึงข้อมูลการเชื่อมต่อจากเอกสาร "ข้อมูล Supabase ที่ต้องใช้.txt"[span_0](end_span)
const SUPABASE_URL = 'https://jkenfjjxwdckmvqjkdkp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZW5mamp4d2Rja212cWprZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjA5NjIsImV4cCI6MjA2NjM5Njk2Mn0.3VOZpt4baNnC5-qpYq6dC9UZ0gcfI2V4aTdi1itxmXI';

// 2. สร้างและ export Supabase client (ฉบับแก้ไข)
// เราเรียกใช้ `createClient` จาก object `supabase` ที่อยู่ใน `window` (ที่โหลดมาจาก CDN)
// เพื่อหลีกเลี่ยงปัญหา ReferenceError ที่เกิดขึ้นก่อนหน้านี้
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 3. Export client เพื่อให้ไฟล์อื่น import ไปใช้ได้
export { supabase };
