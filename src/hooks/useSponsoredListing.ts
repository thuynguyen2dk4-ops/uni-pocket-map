import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
  const { user } = useAuth();

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
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          locationId,
          locationName,
          locationType,
          packageType,
          voucherText,
          successUrl: `${window.location.origin}/?payment=success`,
          cancelUrl: `${window.location.origin}/?payment=cancelled`,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message);
      }

      if (data?.url) {
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

  const getSponsoredListings = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('sponsored_listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sponsored listings:', error);
      return [];
    }
  };

  const getActiveSponsoredLocations = async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('sponsored_listings')
        .select('location_id')
        .eq('status', 'active');

      if (error) throw error;
      return data?.map((item) => item.location_id) || [];
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
