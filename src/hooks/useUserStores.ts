import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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
  status: string;
  created_at: string;
  updated_at: string;
}

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

export interface StoreVoucher {
  id: string;
  store_id: string;
  code: string;
  title_vi: string;
  title_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  discount_type: string;
  discount_value: number;
  min_order: number | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export const useUserStores = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState<UserStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStores = useCallback(async () => {
    if (!user) {
      setStores([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_stores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStores(data || []);
    } catch (err) {
      console.error('Error fetching stores:', err);
      toast.error('Không thể tải danh sách cửa hàng');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const createStore = async (storeData: Omit<UserStore, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_stores')
        .insert({
          ...storeData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setStores(prev => [data, ...prev]);
      toast.success('Đã tạo cửa hàng thành công!');
      return data;
    } catch (err) {
      console.error('Error creating store:', err);
      toast.error('Không thể tạo cửa hàng');
      return null;
    }
  };

  const updateStore = async (storeId: string, updates: Partial<UserStore>) => {
    try {
      const { data, error } = await supabase
        .from('user_stores')
        .update(updates)
        .eq('id', storeId)
        .select()
        .single();

      if (error) throw error;
      setStores(prev => prev.map(s => s.id === storeId ? data : s));
      toast.success('Đã cập nhật cửa hàng!');
      return data;
    } catch (err) {
      console.error('Error updating store:', err);
      toast.error('Không thể cập nhật cửa hàng');
      return null;
    }
  };

  const deleteStore = async (storeId: string) => {
    try {
      const { error } = await supabase
        .from('user_stores')
        .delete()
        .eq('id', storeId);

      if (error) throw error;
      setStores(prev => prev.filter(s => s.id !== storeId));
      toast.success('Đã xóa cửa hàng!');
      return true;
    } catch (err) {
      console.error('Error deleting store:', err);
      toast.error('Không thể xóa cửa hàng');
      return false;
    }
  };

  // Menu items
  const fetchMenuItems = async (storeId: string): Promise<StoreMenuItem[]> => {
    try {
      const { data, error } = await supabase
        .from('store_menu_items')
        .select('*')
        .eq('store_id', storeId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching menu items:', err);
      return [];
    }
  };

  const createMenuItem = async (item: Omit<StoreMenuItem, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('store_menu_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      toast.success('Đã thêm món!');
      return data;
    } catch (err) {
      console.error('Error creating menu item:', err);
      toast.error('Không thể thêm món');
      return null;
    }
  };

  const updateMenuItem = async (itemId: string, updates: Partial<StoreMenuItem>) => {
    try {
      const { data, error } = await supabase
        .from('store_menu_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Đã cập nhật món!');
      return data;
    } catch (err) {
      console.error('Error updating menu item:', err);
      toast.error('Không thể cập nhật món');
      return null;
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('store_menu_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Đã xóa món!');
      return true;
    } catch (err) {
      console.error('Error deleting menu item:', err);
      toast.error('Không thể xóa món');
      return false;
    }
  };

  // Vouchers
  const fetchVouchers = async (storeId: string): Promise<StoreVoucher[]> => {
    try {
      const { data, error } = await supabase
        .from('store_vouchers')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      return [];
    }
  };

  const createVoucher = async (voucher: Omit<StoreVoucher, 'id' | 'used_count' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('store_vouchers')
        .insert(voucher)
        .select()
        .single();

      if (error) throw error;
      toast.success('Đã tạo voucher!');
      return data;
    } catch (err) {
      console.error('Error creating voucher:', err);
      toast.error('Không thể tạo voucher');
      return null;
    }
  };

  const updateVoucher = async (voucherId: string, updates: Partial<StoreVoucher>) => {
    try {
      const { data, error } = await supabase
        .from('store_vouchers')
        .update(updates)
        .eq('id', voucherId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Đã cập nhật voucher!');
      return data;
    } catch (err) {
      console.error('Error updating voucher:', err);
      toast.error('Không thể cập nhật voucher');
      return null;
    }
  };

  const deleteVoucher = async (voucherId: string) => {
    try {
      const { error } = await supabase
        .from('store_vouchers')
        .delete()
        .eq('id', voucherId);

      if (error) throw error;
      toast.success('Đã xóa voucher!');
      return true;
    } catch (err) {
      console.error('Error deleting voucher:', err);
      toast.error('Không thể xóa voucher');
      return false;
    }
  };

  // Image upload
  const uploadImage = async (file: File, folder: string = 'stores'): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('store-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('store-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Không thể tải ảnh lên');
      return null;
    }
  };

  return {
    stores,
    isLoading,
    fetchStores,
    createStore,
    updateStore,
    deleteStore,
    fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    fetchVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    uploadImage,
  };
};
