import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// Định nghĩa lại Type cho khớp với DB
export interface UserStore {
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
}

export const useUserStores = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const user = session?.user;

  // 1. Lấy danh sách cửa hàng (Query)
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['user_stores', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_stores') // <--- ĐÃ SỬA: Dùng đúng tên bảng
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserStore[];
    },
    enabled: !!user,
  });

  // 2. Tạo cửa hàng (Mutation)
  const createStoreMutation = useMutation({
    mutationFn: async (storeData: Omit<UserStore, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error("Vui lòng đăng nhập");

      const { data, error } = await supabase
        .from('user_stores') // <--- ĐÃ SỬA
        .insert({
          ...storeData,
          user_id: user.id, // <--- ĐÃ SỬA: Dùng user_id thay vì owner_id
          status: 'pending' // Mặc định chờ duyệt
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Tự động refresh lại list ngay lập tức
      queryClient.invalidateQueries({ queryKey: ['user_stores'] });
      toast.success('Đã tạo cửa hàng thành công!');
    },
    onError: (err) => {
      console.error(err);
      toast.error('Lỗi khi tạo cửa hàng: ' + err.message);
    },
  });

  // 3. Cập nhật cửa hàng
  const updateStoreMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UserStore> & { id: string }) => {
      // Lọc bỏ các trường undefined/null không cần thiết nếu muốn
      const { error } = await supabase
        .from('user_stores') // <--- ĐÃ SỬA
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_stores'] });
      toast.success('Đã cập nhật cửa hàng!');
    },
    onError: (err) => toast.error('Lỗi cập nhật: ' + err.message),
  });

  // 4. Xóa cửa hàng
  const deleteStoreMutation = useMutation({
    mutationFn: async (storeId: string) => {
      const { error } = await supabase
        .from('user_stores') // <--- ĐÃ SỬA
        .delete()
        .eq('id', storeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_stores'] });
      toast.success('Đã xóa cửa hàng!');
    },
    onError: (err) => toast.error('Lỗi xóa: ' + err.message),
  });

  // Helper upload ảnh (Giữ nguyên logic cũ nhưng bọc lại gọn hơn)
  const uploadImage = async (file: File, folder: string = 'stores'): Promise<string | null> => {
    if (!user) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('store-images') // Đảm bảo bucket này tồn tại
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('store-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Không thể tải ảnh lên');
      return null;
    }
  };

  return {
    stores,
    isLoading,
    createStore: createStoreMutation.mutate,
    updateStore: (id: string, updates: Partial<UserStore>) => updateStoreMutation.mutate({ id, ...updates }),
    deleteStore: deleteStoreMutation.mutate,
    uploadImage,
    // Trả về trạng thái loading của mutation để UI hiển thị spinner
    isCreating: createStoreMutation.isPending,
    isUpdating: updateStoreMutation.isPending,
    isDeleting: deleteStoreMutation.isPending,
  };
};