import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

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
  // is_active: boolean; // Tạm ẩn vì DB chưa có
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
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const user = session?.user;

  // --- A. QUẢN LÝ CỬA HÀNG (STORES) ---

  const { data: stores = [], isLoading, refetch } = useQuery({
    queryKey: ['user_stores', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_stores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UserStore[];
    },
    enabled: !!user,
  });

  const createStoreMutation = useMutation({
    mutationFn: async (storeData: Partial<UserStore>) => {
      if (!user) throw new Error("Vui lòng đăng nhập");
      // Loại bỏ các trường không cần thiết khi insert
      const { id, created_at, updated_at, ...payload } = storeData as any;
      
      // --- SỬA LỖI Ở ĐÂY: XÓA is_active: true ---
      const { data, error } = await supabase
        .from('user_stores')
        .insert({ 
            ...payload, 
            user_id: user.id, 
            status: 'pending' 
            // Đã xóa dòng is_active: true để tránh lỗi DB chưa có cột
        })
        .select().single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_stores'] });
      toast.success('Đã gửi yêu cầu tạo cửa hàng!');
    },
    onError: (err) => toast.error('Lỗi: ' + err.message),
  });

  const updateStoreMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserStore> }) => {
      const { error } = await supabase.from('user_stores').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_stores'] });
      toast.success('Đã cập nhật cửa hàng!');
    },
    onError: (err) => toast.error('Lỗi: ' + err.message),
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async (storeId: string) => {
      const { error } = await supabase.from('user_stores').delete().eq('id', storeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_stores'] });
      toast.success('Đã xóa cửa hàng!');
    },
    onError: (err) => toast.error('Lỗi xóa: ' + err.message),
  });

  // --- B. QUẢN LÝ MENU ---

  const fetchMenuItems = async (storeId: string): Promise<StoreMenuItem[]> => {
    const { data } = await supabase.from('store_menu_items').select('*').eq('store_id', storeId).order('sort_order', { ascending: true });
    return (data as StoreMenuItem[]) || [];
  };

  const createMenuItemMutation = useMutation({
    mutationFn: async (itemData: Partial<StoreMenuItem>) => {
      const { error } = await supabase.from('store_menu_items').insert(itemData as any);
      if (error) throw error;
    },
    onSuccess: () => toast.success('Đã thêm món mới'),
    onError: (err) => toast.error('Lỗi thêm món: ' + err.message),
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StoreMenuItem> }) => {
      const { error } = await supabase.from('store_menu_items').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => toast.success('Đã cập nhật món'),
    onError: (err) => toast.error('Lỗi cập nhật: ' + err.message),
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from('store_menu_items').delete().eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => toast.success('Đã xóa món ăn'),
  });

  // --- C. QUẢN LÝ VOUCHER ---

  const fetchVouchers = async (storeId: string): Promise<StoreVoucher[]> => {
    const { data } = await supabase.from('store_vouchers').select('*').eq('store_id', storeId).order('created_at', { ascending: false });
    return (data as StoreVoucher[]) || [];
  };

  const createVoucherMutation = useMutation({
    mutationFn: async (voucherData: Partial<StoreVoucher>) => {
      const { error } = await supabase.from('store_vouchers').insert(voucherData as any);
      if (error) throw error;
    },
    onSuccess: () => toast.success('Đã tạo voucher'),
    onError: (err) => toast.error('Lỗi tạo voucher: ' + err.message),
  });

  const updateVoucherMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StoreVoucher> }) => {
      const { error } = await supabase.from('store_vouchers').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => toast.success('Đã cập nhật voucher'),
    onError: (err) => toast.error('Lỗi cập nhật: ' + err.message),
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: async (voucherId: string) => {
      const { error } = await supabase.from('store_vouchers').delete().eq('id', voucherId);
      if (error) throw error;
    },
    onSuccess: () => toast.success('Đã xóa voucher'),
  });

  // --- D. UPLOAD IMAGE (ĐÃ SỬA: Hàm này nhận 2 tham số: file và folder) ---
  const uploadImage = async (file: File, folder: string = 'common'): Promise<string | null> => {
    try {
      if (!user) return null;
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars') 
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Lỗi tải ảnh lên');
      return null;
    }
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

    // Common
    uploadImage, // Hàm này giờ đã chuẩn 2 tham số
  };
};