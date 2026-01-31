import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// 👇 Lấy link Backend
const API_URL = import.meta.env.VITE_API_URL;

export interface SponsoredPackage {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  duration: number;
  description: string;
  descriptionEn: string;
}

export const sponsoredPackages: SponsoredPackage[] = [
  {
    id: 'basic',
    name: 'Gói Cơ Bản',
    nameEn: 'Basic Package',
    price: 99000,
    duration: 7,
    description: 'Hiển thị nổi bật 7 ngày',
    descriptionEn: 'Featured display for 7 days',
  },
  {
    id: 'standard',
    name: 'Gói Tiêu Chuẩn',
    nameEn: 'Standard Package',
    price: 249000,
    duration: 30,
    description: 'Hiển thị nổi bật 30 ngày + Badge đặc biệt',
    descriptionEn: 'Featured display for 30 days + Special badge',
  },
  {
    id: 'premium',
    name: 'Gói Premium',
    nameEn: 'Premium Package',
    price: 599000,
    duration: 90,
    description: 'Hiển thị nổi bật 90 ngày + Badge + Voucher',
    descriptionEn: 'Featured display for 90 days + Badge + Voucher',
  },
];

export const useSponsoredListing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // ✅ Đổi session -> user

  // --- 1. Tạo thanh toán ---
  const createCheckout = async (
    locationId: string,
    locationName: string,
    locationType: string,
    packageType: string,
    voucherText?: string
  ) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để tiếp tục');
      return null;
    }

    setIsLoading(true);
    try {
 
      const res = await fetch(`${API_URL}/api/sponsored/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          locationId,
          locationName,
          locationType,
          packageType,
          voucherText,
          successUrl: `${window.location.origin}/?payment=success`,
          cancelUrl: `${window.location.origin}/?payment=cancelled`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Lỗi server');
      }

      if (data?.url) {
        // Chuyển hướng sang trang thanh toán
        window.location.href = data.url;
        return data;
      }

      throw new Error('No checkout URL received');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Không thể tạo phiên thanh toán. Vui lòng thử lại.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. Lấy danh sách gói đã mua của User ---
  const getSponsoredListings = async () => {
    if (!user) return [];

    try {
      const res = await fetch(`${API_URL}/api/sponsored/my-listings?userId=${user.uid}`);
      const data = await res.json();

      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching sponsored listings:', error);
      return [];
    }
  };

  // --- 3. Lấy danh sách các địa điểm đang Active (cho bản đồ) ---
  const getActiveSponsoredLocations = async (): Promise<string[]> => {
    try {
      const res = await fetch(`${API_URL}/api/sponsored/active`);
      const data = await res.json();

      if (Array.isArray(data)) return data; // Trả về mảng ID chuỗi
      return [];
    } catch (error) {
      console.error('Error fetching active sponsored locations:', error);
      return [];
    }
  };

  return {
    isLoading,
    createCheckout,
    getSponsoredListings,
    getActiveSponsoredLocations,
    packages: sponsoredPackages,
  };
};