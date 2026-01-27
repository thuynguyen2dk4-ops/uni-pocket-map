import { useState } from 'react';
import { X, Upload, Loader2, CheckCircle } from 'lucide-react';
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
  const [message, setMessage] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  if (!isOpen || !data) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Kiểm tra Login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vui lòng đăng nhập để thực hiện chức năng này!");
        setIsLoading(false);
        return;
      }

      // 2. Upload ảnh (Nếu có) - Cần tạo Bucket 'store-proofs' trên Supabase trước
      let proofUrl = null;
      if (proofFile) {
        const fileName = `${user.id}/${Date.now()}-${proofFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('store-proofs') // Bạn cần tạo bucket này trên Supabase Storage
          .upload(fileName, proofFile);

        if (uploadError) throw uploadError;
        
        // Lấy public URL
        const { data: { publicUrl } } = supabase.storage
          .from('store-proofs')
          .getPublicUrl(fileName);
        
        proofUrl = publicUrl;
      }

      // 3. Gửi yêu cầu vào bảng store_claims
      const { error } = await supabase
        .from('store_claims')
        .insert({
          user_id: user.id,
          mapbox_id: data.mapboxId,
          mapbox_name: data.name,
          mapbox_address: data.address || '',
          lat: data.lat,
          lng: data.lng,
          message: message,
          proof_image_url: proofUrl,
          status: 'pending' // Chờ duyệt
        });

      if (error) throw error;

      toast.success("Đã gửi yêu cầu xác minh!", {
        description: "Admin sẽ xem xét và phản hồi sớm nhất."
      });
      onClose();

    } catch (error: any) {
      console.error(error);
      toast.error("Có lỗi xảy ra", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Xác nhận chủ sở hữu</h3>
            <p className="text-xs text-gray-500">Cung cấp bằng chứng để quản lý địa điểm này</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Thông tin địa điểm (Readonly) */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Địa điểm chọn</p>
            <h4 className="font-bold text-gray-800">{data.name}</h4>
            <p className="text-xs text-gray-600">{data.address || "Chưa có địa chỉ cụ thể"}</p>
          </div>

          {/* Upload Ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh bằng chứng (Menu, Giấy phép, Biển hiệu...)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {proofFile ? (
                <div className="flex items-center text-green-600 gap-2">
                  <CheckCircle size={20} />
                  <span className="text-sm font-medium truncate max-w-[200px]">{proofFile.name}</span>
                </div>
              ) : (
                <>
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Nhấn để tải ảnh lên</span>
                </>
              )}
            </div>
          </div>

          {/* Lời nhắn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lời nhắn cho Admin</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="VD: Tôi là chủ quán, sđt liên hệ 09xxxx..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Gửi yêu cầu'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};