import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://xssividnqebolxurgzpj.supabase.co'
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzc2l2aWRucWVib2x4dXJnenBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNTQ4NzcsImV4cCI6MjA2NjYzMDg3N30.NiVyqoBXQc7FbxkhmJqDNTA0NAXHYoDczzLs1cKsCbM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 