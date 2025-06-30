// js/services/supabaseClient.js

// 1. ดึง URL และ anom key มาจากไฟล์ config.js (เราจะสร้างไฟล์นี้ในอนาคต)
// แต่ตอนนี้ใส่ค่าลงไปโดยตรงก่อน
const SUPABASE_URL = 'https://jkenfjjxwdckmvqjkdkp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZW5mamp4d2Rja212cWprZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkyNTgwMzcsImV4cCI6MjAzNDgzNDAzN30.i--22tQ2tHnK05rG9OaK3s2h4JdeS6hifS2JkL4d5-8';

// 2. สร้างและ export client ของ Supabase
const supabase = self.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: localStorage, // เปลี่ยนจาก sessionStorage เป็น localStorage เพื่อให้จำการล็อกอินได้นานขึ้น
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// 3. ตั้งค่าให้ Client อัปเดตตัวเองทุกครั้งที่สถานะ Auth เปลี่ยนแปลง (สำคัญมาก)
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        supabase.auth.setSession(session);
    }
});


export { supabase };
