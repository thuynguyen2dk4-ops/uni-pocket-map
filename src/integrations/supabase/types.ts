// Định nghĩa kiểu JSON cơ bản
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// --- 1. PROFILES (Người dùng) ---
export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  created_at: string;
  updated_at: string;
}

// --- 2. USER STORES (Cửa hàng) ---
export interface UserStore {
  id: string;
  user_id: string;
  name_vi: string;
  name_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  address_vi: string;
  address_en: string | null;
  phone: string | null;
  category: string; // 'food', 'cafe', 'office', ...
  lat: number;
  lng: number;
  open_hours_vi: string | null;
  open_hours_en: string | null;
  image_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  
  // Lưu ý: Cột này có thể bạn đã thêm vào DB nhưng chưa cập nhật type cũ
  // Mình thêm vào đây để khớp với logic ở các bước trước
  is_premium?: boolean; 
  
  created_at: string;
  updated_at: string;
}

// --- 3. STORE MENU ITEMS (Thực đơn) ---
export interface StoreMenuItem {
  id: string;
  store_id: string;
  name_vi: string;
  name_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
  created_at: string;
}

// --- 4. STORE VOUCHERS (Mã giảm giá) ---
export interface StoreVoucher {
  id: string;
  store_id: string;
  code: string;
  title_vi: string;
  title_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  discount_type: 'percent' | 'fixed' | string; // 'percent' hoặc 'amount'
  discount_value: number;
  min_order: number | null;
  max_uses: number | null;
  used_count: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

// --- 5. FAVORITES (Yêu thích) ---
export interface Favorite {
  id: string;
  user_id: string;
  location_id: string;
  location_name: string;
  location_name_en: string | null;
  location_lat: number;
  location_lng: number;
  location_type: string;
  created_at: string;
}

// --- 6. SPONSORED LISTINGS (Quảng cáo) ---
export interface SponsoredListing {
  id: string;
  user_id: string;
  location_id: string;
  location_name: string;
  location_type: string;
  voucher_text: string | null;
  amount_paid: number;
  currency: string;
  status: 'active' | 'expired' | 'pending' | string;
  start_date: string | null;
  end_date: string | null;
  stripe_payment_id: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

// --- 7. USER ROLES (Phân quyền) ---
export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}