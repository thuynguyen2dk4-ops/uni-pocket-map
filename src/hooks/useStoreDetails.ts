import { useState, useEffect, useCallback } from 'react';


// 👇 Lấy link Backend
const API_URL = import.meta.env.VITE_API_URL;

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

  // Extract store ID (format: "user-store-{uuid}")
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
      // 👇 Gọi song song 2 API lấy Menu và Voucher
      const [resMenu, resVoucher] = await Promise.all([
        fetch(`${API_URL}/api/stores/${storeId}/menu`),
        fetch(`${API_URL}/api/store-vouchers/${storeId}`)
      ]);

      const menuData = await resMenu.json();
      const voucherData = await resVoucher.json();

      if (Array.isArray(menuData)) {
        setMenuItems(menuData);
      }

      if (Array.isArray(voucherData)) {
        // Backend đã lọc is_active và ngày hết hạn rồi, không cần lọc lại ở đây
        setVouchers(voucherData);
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