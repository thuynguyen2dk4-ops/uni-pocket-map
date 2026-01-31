import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { Location } from "@/data/locations";

// 👇 Lấy link Backend
const API_URL = import.meta.env.VITE_API_URL;

export const useFavorites = () => {
  const { user } = useAuth(); // ✅ Đổi session -> user (Firebase)
  const queryClient = useQueryClient();
  const userId = user?.uid;

  // 1. Lấy danh sách Favorites (Gọi API Backend)
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        const res = await fetch(`${API_URL}/api/favorites?userId=${userId}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error("Failed to fetch favorites");

        // Chuyển đổi dữ liệu DB thành object Location
        return data.map((fav: any) => ({
          id: fav.location_id,
          name: fav.location_name_en || fav.location_name,
          nameVi: fav.location_name,
          type: fav.location_type as any,
          lat: fav.location_lat,
          lng: fav.location_lng,
          address: '', // Có thể update DB để lưu thêm address nếu cần
          description: '',
          image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
          isSponsored: false,
          hasVoucher: false
        })) as Location[];

      } catch (error) {
        console.error(error);
        return [];
      }
    },
    enabled: !!userId,
  });

  // 2. Thêm Favorite (Gọi API Backend)
  const addMutation = useMutation({
    mutationFn: async (location: Location) => {
      if (!userId) throw new Error("Vui lòng đăng nhập");
      const idStr = location.id.toString();
      
      const res = await fetch(`${API_URL}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          locationId: idStr,
          name: location.nameVi || location.name,
          nameEn: location.name || null,
          lat: location.lat,
          lng: location.lng,
          type: location.type
        })
      });

      if (!res.ok) throw new Error("Lỗi khi thêm yêu thích");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success("Đã thêm vào yêu thích ❤️");
    },
    onError: (err) => toast.error(err.message),
  });

  // 3. Xóa Favorite (Gọi API Backend)
  const removeMutation = useMutation({
    mutationFn: async (locationId: string | number) => {
      if (!userId) throw new Error("Vui lòng đăng nhập");
      
      const res = await fetch(`${API_URL}/api/favorites/${locationId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }) // Gửi userId để backend verify quyền sở hữu
      });

      if (!res.ok) throw new Error("Lỗi khi xóa yêu thích");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.info("Đã xóa khỏi yêu thích");
    },
    onError: (err) => toast.error(err.message),
  });

  // Kiểm tra đã thích chưa
  const isFavorite = (locationId: string | number) => {
    return favorites.some(f => f.id.toString() === locationId.toString());
  };

  // Tự động kiểm tra để Thêm hoặc Xóa
  const toggleFavorite = (location: Location) => {
    if (isFavorite(location.id)) {
      removeMutation.mutate(location.id);
    } else {
      addMutation.mutate(location);
    }
  };

  return {
    favorites,
    isLoading,
    addFavorite: addMutation.mutate,
    removeFavorite: removeMutation.mutate,
    isFavorite,
    toggleFavorite,
    isAdding: addMutation.isPending,
  };
};