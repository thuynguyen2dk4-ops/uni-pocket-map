import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Location, LocationType } from '@/data/locations';

export interface ApprovedStore {
  id: string;
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
}

export interface StoreVoucherInfo {
  store_id: string;
  title_vi: string;
  title_en: string | null;
}

const categoryToLocationType = (category: string): LocationType => {
  switch (category) {
    case 'food':
    case 'cafe':
      return 'food';
    case 'service':
    case 'shop':
      return 'job';
    default:
      return 'food';
  }
};

export const useApprovedStores = () => {
  const [stores, setStores] = useState<ApprovedStore[]>([]);
  const [storeVouchers, setStoreVouchers] = useState<Map<string, StoreVoucherInfo>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const fetchApprovedStores = useCallback(async () => {
    try {
      // Fetch approved stores
      const { data: storesData, error: storesError } = await supabase
        .from('user_stores')
        .select('*')
        .eq('status', 'approved');

      if (storesError) throw storesError;
      setStores(storesData || []);

      // Fetch active vouchers for these stores
      if (storesData && storesData.length > 0) {
        const storeIds = storesData.map(s => s.id);
        const { data: vouchersData, error: vouchersError } = await supabase
          .from('store_vouchers')
          .select('store_id, title_vi, title_en')
          .in('store_id', storeIds)
          .eq('is_active', true);

        if (!vouchersError && vouchersData) {
          const voucherMap = new Map<string, StoreVoucherInfo>();
          vouchersData.forEach(v => {
            // Only keep first voucher per store for display
            if (!voucherMap.has(v.store_id)) {
              voucherMap.set(v.store_id, v);
            }
          });
          setStoreVouchers(voucherMap);
        }
      }
    } catch (err) {
      console.error('Error fetching approved stores:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovedStores();
  }, [fetchApprovedStores]);

  // Convert stores to Location format for map display
  const storesAsLocations: Location[] = stores.map(store => {
    const voucher = storeVouchers.get(store.id);
    return {
      id: `user-store-${store.id}`,
      name: store.name_en || store.name_vi,
      nameVi: store.name_vi,
      type: categoryToLocationType(store.category),
      lat: store.lat,
      lng: store.lng,
      description: store.description_vi || '',
      descriptionEn: store.description_en || undefined,
      address: store.address_vi,
      addressEn: store.address_en || undefined,
      image: store.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
      openHours: store.open_hours_vi || undefined,
      openHoursEn: store.open_hours_en || undefined,
      phone: store.phone || undefined,
      isSponsored: false,
      hasVoucher: !!voucher,
      voucherText: voucher?.title_vi,
    };
  });

  return {
    stores,
    storesAsLocations,
    isLoading,
    refetch: fetchApprovedStores,
  };
};
