import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Location } from '@/data/locations';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Favorite {
  id: string;
  location_id: string;
  location_name: string;
  location_name_en: string | null;
  location_lat: number;
  location_lng: number;
  location_type: string;
  created_at: string;
}

export const useFavorites = () => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = useCallback(async (location: Location) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu địa điểm yêu thích');
      return false;
    }

    try {
      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        location_id: location.id,
        location_name: location.nameVi,
        location_name_en: location.name || null,
        location_lat: location.lat,
        location_lng: location.lng,
        location_type: location.type,
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('Địa điểm này đã được lưu');
        } else {
          throw error;
        }
        return false;
      }

      await fetchFavorites();
      toast.success('Đã thêm vào yêu thích');
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Không thể thêm vào yêu thích');
      return false;
    }
  }, [user, fetchFavorites]);

  const removeFavorite = useCallback(async (locationId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('location_id', locationId);

      if (error) throw error;

      await fetchFavorites();
      toast.success('Đã xóa khỏi yêu thích');
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Không thể xóa khỏi yêu thích');
      return false;
    }
  }, [user, fetchFavorites]);

  const isFavorite = useCallback((locationId: string) => {
    return favorites.some(f => f.location_id === locationId);
  }, [favorites]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    isAuthenticated,
  };
};
