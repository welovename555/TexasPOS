const SUPABASE_URL = 'https://cgulsibwftrpshwwmnpc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndWxzaWJ3ZnRycHNod3dtbnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NDQ1MTQsImV4cCI6MjA2NjIyMDUxNH0.8sjb4UeHQZTm7LxcD1UREDfRH20EKzIJnQLNaUSesmU';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
export { supabase };
