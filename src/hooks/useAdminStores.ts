import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// 👇 Lấy link Backend
const API_URL = import.meta.env.VITE_API_URL;

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
  const { user } = useAuth(); // ✅ Đổi session -> user

  const [stores, setStores] = useState<AdminStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // 1. Kiểm tra quyền Admin (Gọi API)
  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/check?userId=${user.uid}`);
      const data = await res.json();
      
      const hasAdminRole = data.isAdmin === true;
      setIsAdmin(hasAdminRole);
      return hasAdminRole;
    } catch (err) {
      console.error('Lỗi kiểm tra admin:', err);
      setIsAdmin(false);
      return false;
    }
  }, [user]);

  // 2. Lấy danh sách cửa hàng (Gọi API)
  const fetchStores = useCallback(async () => {
    if (!user) {
      setStores([]);
      setIsLoading(false);
      return;
    }

    try {
      // Gọi API với tham số filter
      const res = await fetch(`${API_URL}/api/admin/stores?status=${filter}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setStores(data);
      } else {
        throw new Error("Invalid data format");
      }
      
    } catch (err) {
      console.error('Lỗi tải danh sách cửa hàng:', err);
      toast.error('Không thể tải danh sách cửa hàng');
    } finally {
      setIsLoading(false);
    }
  }, [user, filter]);

  // 3. Khởi chạy
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

  // 4. Cập nhật trạng thái (Duyệt/Từ chối)
  const updateStoreStatus = async (storeId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stores/${storeId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error("Failed to update");

      // Update thành công -> Cập nhật giao diện ngay lập tức (Optimistic UI)
      setStores(prev => prev.map(s => 
        s.id === storeId ? { ...s, status } : s
      ));
      
      // Nếu đang ở tab pending thì ẩn nó đi cho gọn
      if (filter === 'pending') {
           setStores(prev => prev.filter(s => s.id !== storeId));
      }

      toast.success(status === 'approved' ? 'Đã duyệt xong!' : 'Đã từ chối!');

    } catch (err: any) {
      console.error('Lỗi Update:', err);
      toast.error("Lỗi kết nối server");
    }
  };

  // 5. Xóa cửa hàng
  const deleteStore = async (storeId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/stores/${storeId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error("Failed to delete");
      
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