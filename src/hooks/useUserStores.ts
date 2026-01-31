import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import { toast } from "sonner";

// 👇 Lấy link Backend
const API_URL = import.meta.env.VITE_API_URL;

// --- 1. ĐỊNH NGHĨA INTERFACE ---

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
  category: string;
  lat: number;
  lng: number;
  open_hours_vi: string | null;
  open_hours_en: string | null;
  image_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface StoreMenuItem {
  id: string;
  store_id: string;
  name_vi: string;
  name_en?: string;
  description_vi?: string;
  description_en?: string;
  price: number;
  image_url?: string;
  category?: string;
  is_available: boolean;
  sort_order?: number;
}

export interface StoreVoucher {
  id: string;
  store_id: string;
  code: string;
  title_vi: string;
  title_en?: string;
  description_vi?: string;
  description_en?: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_value?: number;
  min_order?: number;     
  max_discount_amount?: number;
  start_date?: string;
  end_date?: string;
  usage_limit?: number;
  max_uses?: number;      
  used_count?: number;
  is_active: boolean;
}

// --- 2. HOOK CHÍNH ---

export const useUserStores = () => {
  const { user } = useAuth(); // ✅ Đổi session -> user
  const queryClient = useQueryClient();

  // --- A. QUẢN LÝ CỬA HÀNG (STORES) ---

  const { data: stores = [], isLoading, refetch } = useQuery({
    queryKey: ['user_stores', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await fetch(`${API_URL}/api/user-stores?userId=${user.uid}`);
        const data = await res.json();
        return Array.isArray(data) ? data as UserStore[] : [];
      } catch (err) {
        console.error(err);
        return [];
      }
    },
    enabled: !!user,
  });

  // 1. Tạo Store (Đã chuyển sang dùng API upload + create gộp ở StoreFormModal)
  // Hàm này chỉ giữ lại để tương thích code cũ nếu có gọi trực tiếp
  const createStoreMutation = useMutation({
    mutationFn: async (storeData: Partial<UserStore>) => {
      // Logic tạo store đã được chuyển sang StoreFormModal dùng FormData
      // Ở đây chỉ giả lập
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_stores'] });
      toast.success('Đã gửi yêu cầu tạo cửa hàng!');
    }
  });

  // 2. Cập nhật Store
  const updateStoreMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserStore> }) => {
      // Logic update store cũng đã chuyển sang StoreFormModal
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_stores'] });
      toast.success('Đã cập nhật cửa hàng!');
    }
  });

  // 3. Xóa Store
  const deleteStoreMutation = useMutation({
    mutationFn: async (storeId: string) => {
      const res = await fetch(`${API_URL}/api/stores/${storeId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_stores'] });
      toast.success('Đã xóa cửa hàng!');
    },
    onError: (err) => toast.error('Lỗi xóa: ' + err.message),
  });

  // --- B. QUẢN LÝ MENU ---

  const fetchMenuItems = async (storeId: string): Promise<StoreMenuItem[]> => {
    try {
      const res = await fetch(`${API_URL}/api/stores/${storeId}/menu`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  const createMenuItemMutation = useMutation({
    mutationFn: async (itemData: Partial<StoreMenuItem>) => {
      const res = await fetch(`${API_URL}/api/menu-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => toast.success('Đã thêm món mới'),
    onError: (err) => toast.error('Lỗi thêm món: ' + err.message),
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StoreMenuItem> }) => {
      const res = await fetch(`${API_URL}/api/menu-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => toast.success('Đã cập nhật món'),
    onError: (err) => toast.error('Lỗi cập nhật: ' + err.message),
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`${API_URL}/api/menu-items/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => toast.success('Đã xóa món ăn'),
  });

  // --- C. QUẢN LÝ VOUCHER ---

  const fetchVouchers = async (storeId: string): Promise<StoreVoucher[]> => {
    try {
      // Lấy tất cả voucher để quản lý
      const res = await fetch(`${API_URL}/api/stores/${storeId}/vouchers-all`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  const createVoucherMutation = useMutation({
    mutationFn: async (voucherData: Partial<StoreVoucher>) => {
      const res = await fetch(`${API_URL}/api/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData)
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => toast.success('Đã tạo voucher'),
    onError: (err) => toast.error('Lỗi tạo voucher: ' + err.message),
  });

  const updateVoucherMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StoreVoucher> }) => {
      const res = await fetch(`${API_URL}/api/vouchers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => toast.success('Đã cập nhật voucher'),
    onError: (err) => toast.error('Lỗi cập nhật: ' + err.message),
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: async (voucherId: string) => {
      const res = await fetch(`${API_URL}/api/vouchers/${voucherId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => toast.success('Đã xóa voucher'),
  });

  // --- D. UPLOAD IMAGE (Giả lập) ---
  const uploadImage = async (file: File, folder: string = 'common'): Promise<string | null> => {
 
    // bạn cần dùng API upload riêng hoặc trả về URL dummy để test.
    // Logic upload thật nên được thực hiện trong Form submit (như StoreFormModal đã làm).
    
    // Giả lập trả về URL để UI hiển thị preview
    return URL.createObjectURL(file);
  };

  // --- E. RETURN ĐẦY ĐỦ ---
  return {
    stores,
    isLoading,
    fetchStores: refetch,
    
    // Store Actions
    createStore: createStoreMutation.mutateAsync,
    updateStore: async (id: string, data: Partial<UserStore>) => {
      return await updateStoreMutation.mutateAsync({ id, data });
    },
    deleteStore: deleteStoreMutation.mutateAsync,

    // Menu Actions
    fetchMenuItems,
    createMenuItem: createMenuItemMutation.mutateAsync,
    updateMenuItem: async (id: string, data: Partial<StoreMenuItem>) => {
      return await updateMenuItemMutation.mutateAsync({ id, data });
    },
    deleteMenuItem: deleteMenuItemMutation.mutateAsync,

    // Voucher Actions
    fetchVouchers,
    createVoucher: createVoucherMutation.mutateAsync,
    updateVoucher: async (id: string, data: Partial<StoreVoucher>) => {
      return await updateVoucherMutation.mutateAsync({ id, data });
    },
    deleteVoucher: deleteVoucherMutation.mutateAsync,

    uploadImage, 
  };
};