import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Location, LocationType } from '@/data/locations';

// Helper chuyển đổi category từ Database sang LocationType của Map
const categoryToLocationType = (category: string): LocationType => {
  // Danh sách các loại hợp lệ mà MapView.tsx đang hỗ trợ
  const validTypes: LocationType[] = [
    'food', 'cafe', 'entertainment', 
    'lecture_hall', 'office', 'housing', 
    'job', 'building', 'checkin'
  ];

  // Nếu category trong DB khớp với loại hợp lệ thì trả về chính nó
  if (validTypes.includes(category as LocationType)) {
    return category as LocationType;
  }

  // Fallback: Tùy theo tên cũ để map sang loại mới (hỗ trợ dữ liệu cũ)
  switch (category) {
    case 'service':
    case 'shop':
      return 'job';
    case 'school':
    case 'university':
      return 'lecture_hall';
    default:
      // Mặc định trả về 'building' (Tòa nhà) thay vì 'food' để tránh hiểu nhầm
      return 'building';
  }
};

export const useApprovedStores = () => {
  const { data: storesAsLocations = [], isLoading, refetch } = useQuery({
    queryKey: ['approved_stores'],
    queryFn: async () => {
      // 1. Lấy danh sách cửa hàng đã duyệt
      const { data: storesData, error: storesError } = await supabase
        .from('user_stores')
        .select('*')
        .eq('status', 'approved');

      if (storesError) {
        console.error("Error fetching stores:", storesError);
        throw storesError;
      }
      
      if (!storesData || storesData.length === 0) return [];

      // 2. Lấy voucher
      const storeIds = storesData.map(s => s.id);
      const { data: vouchersData } = await supabase
        .from('store_vouchers')
        .select('store_id, title_vi')
        .in('store_id', storeIds)
        .eq('is_active', true);

      const voucherMap = new Map();
      if (vouchersData) {
        vouchersData.forEach((v: any) => {
          if (!voucherMap.has(v.store_id)) voucherMap.set(v.store_id, v);
        });
      }

      // 3. Chuyển đổi dữ liệu
      return storesData.map((store) => {
        const voucher = voucherMap.get(store.id);
        
        // Kiểm tra VIP
        const isPremium = store.is_premium === true;

        return {
          id: `user-store-${store.id}`,
          name: store.name_en || store.name_vi, 
          nameVi: store.name_vi,
          
          // SỬA LỖI TẠI ĐÂY: Hàm chuyển đổi mới
          type: categoryToLocationType(store.category), 
          // Lưu lại category gốc để BottomSheet dùng nếu cần
          category: store.category, 

          lat: store.lat,
          lng: store.lng,
          description: store.description_vi || '',
          address: store.address_vi,
          image: store.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
          
          // Map is_premium sang isSponsored để MapView hiển thị to hơn
          isSponsored: isPremium, 
          // Truyền nguyên biến is_premium để BottomSheet hiển thị vương miện
          is_premium: isPremium, 

          hasVoucher: !!voucher,
          voucherText: voucher?.title_vi,
          
          // Truyền thêm review nếu có (để tính sao)
          reviews: [] // Hiện tại để rỗng, sau này bạn có thể join bảng reviews vào
        } as unknown as Location; 
        // as unknown as Location để bypass vài trường thiếu nếu interface Location quá chặt
      });
    },
    staleTime: 1000 * 60, 
  });

  return {
    storesAsLocations,
    isLoading,
    refetch,
  };
};