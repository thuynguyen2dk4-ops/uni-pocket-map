import { useQuery } from "@tanstack/react-query";

import { Location, LocationType } from '@/data/locations';

// 👇 Lấy link Backend
const API_URL = import.meta.env.VITE_API_URL;

// Helper chuyển đổi category từ Database sang LocationType của Map
const categoryToLocationType = (category: string): LocationType => {
  const validTypes: LocationType[] = [
    'food', 'cafe', 'entertainment', 
    'lecture_hall', 'office', 'housing', 
    'job', 'building', 'checkin'
  ];

  if (validTypes.includes(category as LocationType)) {
    return category as LocationType;
  }

  switch (category) {
    case 'service':
    case 'shop':
      return 'job';
    case 'school':
    case 'university':
      return 'lecture_hall';
    default:
      return 'building';
  }
};

export const useApprovedStores = () => {
  const { data: storesAsLocations = [], isLoading, refetch } = useQuery({
    queryKey: ['approved_stores'],
    queryFn: async () => {
      try {
        // 1. Gọi song song 2 API: Lấy Store đã duyệt & Voucher đang chạy
        const [resStores, resVouchers] = await Promise.all([
          fetch(`${API_URL}/api/stores/approved`),
          fetch(`${API_URL}/api/vouchers/active`)
        ]);

        const storesData = await resStores.json();
        const vouchersData = await resVouchers.json();

        if (!Array.isArray(storesData)) return [];

        // 2. Tạo Map để tra cứu Voucher nhanh (theo store_id)
        const voucherMap = new Map();
        if (Array.isArray(vouchersData)) {
          vouchersData.forEach((v: any) => {
            // API vouchers/active trả về store_id, ta map vào
            if (!voucherMap.has(v.store_id)) {
                // Chỉ lấy voucher đầu tiên tìm thấy làm đại diện hiển thị trên map
                voucherMap.set(v.store_id, v); 
            }
          });
        }

        // 3. Chuyển đổi dữ liệu sang format Location của Map
        return storesData.map((store: any) => {
          const voucher = voucherMap.get(store.id);
          
          // Kiểm tra VIP
          const isPremium = store.is_premium === true;

          return {
            id: `user-store-${store.id}`, // ID định danh riêng cho user store
            name: store.name_en || store.name_vi, 
            nameVi: store.name_vi,
            
            type: categoryToLocationType(store.category), 
            category: store.category, 

            lat: store.lat,
            lng: store.lng,
            description: store.description_vi || '',
            address: store.address_vi,
            image: store.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
            
            // MapView sẽ hiển thị icon to hơn nếu là sponsored (VIP)
            isSponsored: isPremium, 
            is_premium: isPremium, 

            hasVoucher: !!voucher,
            voucherText: voucher?.title_vi || voucher?.code, // Hiển thị tên voucher hoặc mã
            
            reviews: [] // Reviews sẽ được load chi tiết khi click vào marker
          } as unknown as Location; 
        });

      } catch (error) {
        console.error("Lỗi tải dữ liệu bản đồ:", error);
        return [];
      }
    },
    staleTime: 1000 * 60, // Cache trong 1 phút
  });

  return {
    storesAsLocations,
    isLoading,
    refetch,
  };
};