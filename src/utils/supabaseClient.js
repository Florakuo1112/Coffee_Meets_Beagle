import { createClient } from '@supabase/supabase-js'

// 從你的環境變數中讀取 Supabase 專案網址與金鑰
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 建立並匯出 Supabase 客戶端實例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
