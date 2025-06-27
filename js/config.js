const SUPABASE_URL = 'https://jkenfjjxwdckmvqjkdkp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZW5mamp4d2Rja212cWprZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjA5NjIsImV4cCI6MjA2NjM5Njk2Mn0.3VOZpt4baNnC5-qpYq6dC9UZ0gcfI2V4aTdi1itxmXI';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { client as supabaseClient };


//
