import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface AdminStore {
  id: string;
  user_id: string;
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
  status: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

export const useAdminStores = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Check if user is admin
  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      const hasAdminRole = !!data;
      setIsAdmin(hasAdminRole);
      return hasAdminRole;
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
      return false;
    }
  }, [user]);

  const fetchStores = useCallback(async () => {
    if (!user) {
      setStores([]);
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('user_stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch user emails for each store
      const storesWithEmails: AdminStore[] = [];
      for (const store of data || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', store.user_id)
          .single();
        
        storesWithEmails.push({
          ...store,
          user_email: profile?.email || 'N/A'
        });
      }
      
      setStores(storesWithEmails);
    } catch (err) {
      console.error('Error fetching stores:', err);
      toast.error('Không thể tải danh sách cửa hàng');
    } finally {
      setIsLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    const init = async () => {
      const hasAdmin = await checkAdminStatus();
      if (hasAdmin) {
        await fetchStores();
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, [checkAdminStatus, fetchStores]);

  const updateStoreStatus = async (storeId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('user_stores')
        .update({ status })
        .eq('id', storeId);

      if (error) throw error;
      
      setStores(prev => prev.map(s => 
        s.id === storeId ? { ...s, status } : s
      ));
      
      toast.success(status === 'approved' ? 'Đã duyệt cửa hàng!' : 'Đã từ chối cửa hàng!');
      return true;
    } catch (err) {
      console.error('Error updating store status:', err);
      toast.error('Không thể cập nhật trạng thái');
      return false;
    }
  };

  const deleteStore = async (storeId: string) => {
    try {
      const { error } = await supabase
        .from('user_stores')
        .delete()
        .eq('id', storeId);

      if (error) throw error;
      
      setStores(prev => prev.filter(s => s.id !== storeId));
      toast.success('Đã xóa cửa hàng!');
      return true;
    } catch (err) {
      console.error('Error deleting store:', err);
      toast.error('Không thể xóa cửa hàng');
      return false;
    }
  };

  return {
    stores,
    isLoading,
    isAdmin,
    filter,
    setFilter,
    fetchStores,
    updateStoreStatus,
    deleteStore,
  };
};
