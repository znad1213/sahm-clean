import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = 'https://slbrfkiuyvqqvedihquc.supabase.co'; 
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYnJma2l1eXZxcXZlZGlocXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjM4MTcsImV4cCI6MjA2Mjc5OTgxN30.vXjZC5kbN3jfK0VTE9UjkWSQHKxoIfqhwwRpi3eLdH0'; 

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);