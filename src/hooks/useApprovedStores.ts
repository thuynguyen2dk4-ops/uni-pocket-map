import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Location, LocationType } from '@/data/locations';

// Helper chuyển đổi category sang LocationType
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
  // Sử dụng useQuery để lấy dữ liệu, cache và tự động cập nhật
  const { data: storesAsLocations = [], isLoading, refetch } = useQuery({
    queryKey: ['approved_stores'],
    queryFn: async () => {
      // 1. Lấy danh sách cửa hàng đã được duyệt (status = 'approved')
      const { data: storesData, error: storesError } = await supabase
        .from('user_stores')
        .select('*')
        .eq('status', 'approved');

      if (storesError) {
        console.error("Error fetching stores:", storesError);
        throw storesError;
      }
      
      if (!storesData || storesData.length === 0) return [];

      // 2. Lấy voucher đang hoạt động của các store này
      const storeIds = storesData.map(s => s.id);
      const { data: vouchersData } = await supabase
        .from('store_vouchers')
        .select('store_id, title_vi')
        .in('store_id', storeIds)
        .eq('is_active', true);

      // Tạo Map để tra cứu voucher nhanh hơn
      const voucherMap = new Map();
      if (vouchersData) {
        vouchersData.forEach((v: any) => {
          // Chỉ lấy voucher đầu tiên tìm thấy cho mỗi store
          if (!voucherMap.has(v.store_id)) voucherMap.set(v.store_id, v);
        });
      }

      // 3. Chuyển đổi dữ liệu từ DB sang format Location để hiển thị trên Map
      return storesData.map((store) => {
        const voucher = voucherMap.get(store.id);
        return {
          id: `user-store-${store.id}`, // Thêm tiền tố để tránh trùng ID với địa điểm tĩnh
          name: store.name_en || store.name_vi, // Ưu tiên tên tiếng Anh nếu có (hoặc tùy logic ngôn ngữ của bạn)
          nameVi: store.name_vi,
          type: categoryToLocationType(store.category),
          lat: store.lat,
          lng: store.lng,
          description: store.description_vi || '',
          address: store.address_vi,
          image: store.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
          isSponsored: false,
          hasVoucher: !!voucher,
          voucherText: voucher?.title_vi,
        } as Location;
      });
    },
    // Cache trong 1 phút, sau đó sẽ fetch lại ngầm
    staleTime: 1000 * 60, 
  });

  return {
    storesAsLocations,
    isLoading,
    refetch,
  };
};