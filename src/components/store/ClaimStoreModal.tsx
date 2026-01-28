import { useState } from 'react';
import { X, Upload, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ClaimData {
  mapboxId: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
}

interface ClaimStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ClaimData | null;
}

export const ClaimStoreModal = ({ isOpen, onClose, data }: ClaimStoreModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Form nhập liệu mới
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    role: 'Chủ sở hữu',
    message: ''
  });
  
  // Quản lý nhiều file ảnh
  const [proofFiles, setProofFiles] = useState<File[]>([]);

  if (!isOpen || !data) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (proofFiles.length + filesArray.length > 5) {
        toast.error("Chỉ được tải tối đa 5 ảnh");
        return;
      }
      setProofFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setProofFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (proofFiles.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 ảnh bằng chứng!");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vui lòng đăng nhập!");
        setIsLoading(false);
        return;
      }

      // 1. Upload từng ảnh lên Storage
      const uploadPromises = proofFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('store-proofs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('store-proofs')
          .getPublicUrl(fileName);
          
        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // 2. Gửi dữ liệu vào DB
      const { error } = await supabase
        .from('store_claims')
        .insert({
          user_id: user.id,
          mapbox_id: String(data.mapboxId), // Lưu ID để check trùng
          mapbox_name: data.name,
          mapbox_address: data.address || '',
          lat: data.lat,
          lng: data.lng,
          
          // Các cột mới
          phone: formData.phone,
          email: formData.email,
          role: formData.role,
          proof_images: uploadedUrls, // Lưu mảng ảnh
          
          // Cột cũ (giữ lại để tương thích code cũ nếu cần)
          message: formData.message,
          proof_image_url: uploadedUrls[0], 
          
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Đã gửi yêu cầu xác minh!");
      onClose();

    } catch (error: any) {
      console.error(error);
      toast.error("Lỗi: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Xác nhận chủ sở hữu</h3>
            <p className="text-xs text-gray-500">Cung cấp thông tin quản lý: <span className="font-bold">{data.name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} className="text-gray-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Vai trò <span className="text-red-500">*</span></label>
              <select className="w-full mt-1 p-2 border rounded-lg text-sm bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option>Chủ sở hữu</option>
                <option>Quản lý</option>
                <option>Nhân viên</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">SĐT <span className="text-red-500">*</span></label>
              <input type="tel" required className="w-full mt-1 p-2 border rounded-lg text-sm" placeholder="09xxxxxxxx" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
            <input type="email" required className="w-full mt-1 p-2 border rounded-lg text-sm" placeholder="email@cuahang.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh bằng chứng (Giấy phép, CCCD...) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {proofFiles.map((file, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeFile(idx)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"><X size={12} /></button>
                </div>
              ))}
              {proofFiles.length < 5 && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 aspect-square">
                  <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                  <Upload size={16} className="text-gray-400" />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Lời nhắn</label>
            <textarea rows={2} className="w-full mt-1 p-2 border rounded-lg text-sm" placeholder="Ghi chú thêm..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex gap-3 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-white border hover:bg-gray-50 rounded-lg text-sm">Hủy</button>
          <button type="submit" onClick={handleSubmit} disabled={isLoading} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Gửi xác minh'}
          </button>
        </div>
      </div>
    </div>
  );
};