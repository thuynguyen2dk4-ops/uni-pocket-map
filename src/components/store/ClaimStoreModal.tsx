import { useState, useEffect } from 'react';
import { X, Upload, Loader2, CheckCircle, Trash2, Image as ImageIcon } from 'lucide-react';
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
  
  // State quản lý form
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    role: 'Chủ sở hữu',
    message: ''
  });
  
  // State quản lý danh sách ảnh
  const [proofFiles, setProofFiles] = useState<File[]>([]);

  // Reset form mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      setFormData({ phone: '', email: '', role: 'Chủ sở hữu', message: '' });
      setProofFiles([]);
      // Tự động lấy email đăng nhập điền sẵn (User UX)
      const getUserEmail = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setFormData(prev => ({ ...prev, email: user.email! }));
        }
      };
      getUserEmail();
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  // Xử lý chọn ảnh (Cho phép chọn nhiều)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (proofFiles.length + filesArray.length > 5) {
        toast.error("Chỉ được tải lên tối đa 5 ảnh minh chứng");
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
      toast.error("Vui lòng tải lên ít nhất 1 ảnh bằng chứng (Giấy phép, biển hiệu...)");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vui lòng đăng nhập để gửi yêu cầu!");
        setIsLoading(false);
        return;
      }

      // 1. Upload tất cả ảnh lên Storage
      const uploadPromises = proofFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        // Upload
        const { error: uploadError } = await supabase.storage
          .from('store-proofs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Lấy URL
        const { data: { publicUrl } } = supabase.storage
          .from('store-proofs')
          .getPublicUrl(fileName);
          
        return publicUrl;
      });

      // Chờ tất cả ảnh upload xong
      const uploadedUrls = await Promise.all(uploadPromises);

      // 2. Gửi thông tin vào bảng store_claims
      const { error } = await supabase
        .from('store_claims')
        .insert({
          user_id: user.id,
          mapbox_id: String(data.mapboxId), // ID Mapbox (Quan trọng để check trùng)
          mapbox_name: data.name,
          mapbox_address: data.address || '',
          lat: data.lat,
          lng: data.lng,
          
          // Các thông tin liên hệ
          phone: formData.phone,
          email: formData.email,
          role: formData.role,
          message: formData.message,
          
          // Lưu ảnh (Lưu cả mảng và ảnh đơn để tương thích ngược)
          proof_images: uploadedUrls,    // Cột mới (Mảng)
          proof_image_url: uploadedUrls[0], // Cột cũ (String)
          
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Đã gửi yêu cầu xác minh!", {
        description: "Admin sẽ xem xét thông tin và phản hồi sớm nhất."
      });
      onClose();

    } catch (error: any) {
      console.error(error);
      toast.error("Gửi thất bại", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Xác nhận chủ sở hữu</h3>
            <p className="text-xs text-gray-500">Gửi thông tin xác minh cho: <span className="font-semibold text-blue-600">{data.name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body (Cuộn được) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Form nhập liệu */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Vai trò <span className="text-red-500">*</span></label>
              <select 
                className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option>Chủ sở hữu</option>
                <option>Quản lý cửa hàng</option>
                <option>Nhân viên đại diện</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
              <input 
                type="tel"
                required
                className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0912xxxxxx"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email liên hệ công việc <span className="text-red-500">*</span></label>
            <input 
              type="email"
              required
              className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="contact@cuahang.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <p className="text-[10px] text-gray-400 mt-1">*Mặc định là email đăng nhập, bạn có thể thay đổi.</p>
          </div>

          {/* Upload Ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh bằng chứng (Giấy phép KD, Menu, Mặt tiền...) <span className="text-red-500">*</span>
            </label>
            
            <div className="grid grid-cols-4 gap-3">
              {/* Danh sách ảnh đã chọn */}
              {proofFiles.map((file, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                  <button 
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {/* Nút thêm ảnh (Ẩn nếu đủ 5 ảnh) */}
              {proofFiles.length < 5 && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors aspect-square">
                  <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                  <Upload size={20} className="text-gray-400 mb-1" />
                  <span className="text-[10px] text-gray-500 font-medium">Thêm ảnh</span>
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Đã chọn {proofFiles.length}/5 ảnh. Hãy chụp rõ nét.</p>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-gray-700">Lời nhắn / Ghi chú</label>
            <textarea 
              rows={3}
              className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ví dụ: Tôi mới sang nhượng lại quán này..."
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-xl text-sm transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-colors"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Gửi xác minh'}
          </button>
        </div>

      </div>
    </div>
  );
};