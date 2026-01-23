import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { Location } from "@/data/locations";

export const useFavorites = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  // 1. Lấy danh sách Favorites
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;

      // Chuyển đổi dữ liệu DB thành object Location
      return data.map(fav => ({
        id: fav.location_id,
        name: fav.location_name_en || fav.location_name,
        nameVi: fav.location_name,
        type: fav.location_type as any,
        lat: fav.location_lat,
        lng: fav.location_lng,
        address: '', 
        description: '',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
        isSponsored: false,
        hasVoucher: false
      })) as Location[];
    },
    enabled: !!userId,
  });

  // 2. Thêm Favorite
  const addMutation = useMutation({
    mutationFn: async (location: Location) => {
      if (!userId) throw new Error("Vui lòng đăng nhập");
      const idStr = location.id.toString();
      
      // Kiểm tra trùng
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('location_id', idStr)
        .maybeSingle();

      if (existing) return;

      // Insert vào DB
      const { error } = await supabase
        .from('favorites')
        .insert({ 
          user_id: userId, 
          location_id: idStr,
          location_name: location.nameVi || location.name,
          location_name_en: location.name || null,
          location_lat: location.lat,
          location_lng: location.lng,
          location_type: location.type
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success("Đã thêm vào yêu thích ❤️");
    },
    onError: (err) => toast.error(err.message),
  });

  // 3. Xóa Favorite
  const removeMutation = useMutation({
    mutationFn: async (locationId: string | number) => {
      if (!userId) throw new Error("Vui lòng đăng nhập");
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('location_id', locationId.toString());
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.info("Đã xóa khỏi yêu thích");
    },
    onError: (err) => toast.error(err.message),
  });

  const isFavorite = (locationId: string | number) => {
    return favorites.some(f => f.id.toString() === locationId.toString());
  };

  // --- HÀM MỚI: Tự động kiểm tra để Thêm hoặc Xóa ---
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
    toggleFavorite, // <--- Đã thêm export hàm này
    isAdding: addMutation.isPending,
  };
};