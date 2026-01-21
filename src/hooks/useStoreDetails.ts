import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StoreMenuItem {
  id: string;
  name_vi: string;
  name_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
}

export interface StoreVoucher {
  id: string;
  code: string;
  title_vi: string;
  title_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  discount_type: string;
  discount_value: number;
  min_order: number | null;
  is_active: boolean;
  end_date: string | null;
}

export const useStoreDetails = (locationId: string | null) => {
  const [menuItems, setMenuItems] = useState<StoreMenuItem[]>([]);
  const [vouchers, setVouchers] = useState<StoreVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Extract store ID from location ID (format: "user-store-{uuid}")
  const storeId = locationId?.startsWith('user-store-') 
    ? locationId.replace('user-store-', '') 
    : null;

  const fetchStoreDetails = useCallback(async () => {
    if (!storeId) {
      setMenuItems([]);
      setVouchers([]);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch menu items
      const { data: menuData, error: menuError } = await supabase
        .from('store_menu_items')
        .select('id, name_vi, name_en, description_vi, description_en, price, image_url, is_available')
        .eq('store_id', storeId)
        .eq('is_available', true)
        .order('sort_order', { ascending: true });

      if (!menuError) {
        setMenuItems(menuData || []);
      }

      // Fetch active vouchers
      const { data: voucherData, error: voucherError } = await supabase
        .from('store_vouchers')
        .select('id, code, title_vi, title_en, description_vi, description_en, discount_type, discount_value, min_order, is_active, end_date')
        .eq('store_id', storeId)
        .eq('is_active', true);

      if (!voucherError) {
        // Filter out expired vouchers
        const now = new Date();
        const activeVouchers = (voucherData || []).filter(v => {
          if (!v.end_date) return true;
          return new Date(v.end_date) > now;
        });
        setVouchers(activeVouchers);
      }
    } catch (err) {
      console.error('Error fetching store details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchStoreDetails();
  }, [fetchStoreDetails]);

  return {
    menuItems,
    vouchers,
    isLoading,
    isUserStore: !!storeId,
  };
};
