import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 1. Lấy biến môi trường
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Kiểm tra chặt chẽ: Nếu thiếu là báo lỗi đỏ màn hình luôn (để bạn biết mà sửa)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ THIẾU CẤU HÌNH SUPABASE: Vui lòng kiểm tra file .env hoặc khởi động lại server!');
}

// 3. Khởi tạo Client sạch (không dùng fallback giả nữa)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);