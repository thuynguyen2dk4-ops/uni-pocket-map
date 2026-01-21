import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Lấy biến môi trường
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- FALLBACK ĐỂ TRÁNH CRASH (QUAN TRỌNG) ---
// Nếu chưa có key (do đang chạy trên Lovable hoặc chưa cấu hình .env),
// ta dùng một URL giả để hàm createClient không báo lỗi "URL required".
// Điều này giúp giao diện web vẫn hiện lên để bạn xem Demo.
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ CẢNH BÁO: Chưa cấu hình Supabase Key. App đang chạy ở chế độ Demo/Offline.\n" +
    "Các tính năng gọi API thực tế sẽ không hoạt động cho đến khi bạn cấu hình file .env"
  );
}

// Khởi tạo Supabase Client an toàn
export const supabase = createClient<Database>(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey
);
