import { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// 👇 Lấy link Backend
const API_URL = import.meta.env.VITE_API_URL;

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
  const { user } = useAuth(); // ✅ Lấy user từ Firebase Auth
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    role: 'Chủ sở hữu',
    message: ''
  });
  
  const [proofFiles, setProofFiles] = useState<File[]>([]);

  // Reset form
  useEffect(() => {
    if (isOpen) {
      setFormData({ 
        phone: '', 
        role: 'Chủ sở hữu', 
        message: '',
        email: user?.email || '' // Tự điền email
      });
      setProofFiles([]);
    }
  }, [isOpen, user]);

  if (!isOpen || !data) return null;

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
      toast.error("Vui lòng tải lên ít nhất 1 ảnh bằng chứng");
      return;
    }
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Tạo FormData để chứa cả File và Text
      const submitData = new FormData();
      
      // Append các trường text
      submitData.append('userId', user.uid);
      submitData.append('mapboxId', String(data.mapboxId));
      submitData.append('mapboxName', data.name);
      submitData.append('mapboxAddress', data.address || '');
      submitData.append('lat', String(data.lat));
      submitData.append('lng', String(data.lng));
      submitData.append('phone', formData.phone);
      submitData.append('email', formData.email);
      submitData.append('role', formData.role);
      submitData.append('message', formData.message);

      // Append từng file ảnh
      proofFiles.forEach((file) => {
        submitData.append('proofFiles', file);
      });

      // 2. Gửi về Backend
      const res = await fetch(`${API_URL}/api/claims/submit`, {
        method: 'POST',
        body: submitData, // Không cần set Content-Type, trình duyệt tự làm
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gửi thất bại");
      }

      toast.success("Đã gửi yêu cầu xác minh!", {
        description: "Admin sẽ xem xét thông tin và phản hồi sớm nhất."
      });
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Vai trò <span className="text-red-500">*</span></label>
              <select 
                className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm outline-none bg-white"
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
                type="tel" required placeholder="0912xxxxxx"
                className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm outline-none"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email liên hệ <span className="text-red-500">*</span></label>
            <input 
              type="email" required
              className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm outline-none"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Upload Ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh bằng chứng (Giấy phép KD, Menu...) <span className="text-red-500">*</span>
            </label>
            
            <div className="grid grid-cols-4 gap-3">
              {proofFiles.map((file, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                  <button 
                    type="button" onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {proofFiles.length < 5 && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 aspect-square">
                  <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                  <Upload size={20} className="text-gray-400 mb-1" />
                  <span className="text-[10px] text-gray-500 font-medium">Thêm ảnh</span>
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Lời nhắn</label>
            <textarea 
              rows={3}
              className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm outline-none"
              placeholder="Ghi chú thêm..."
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-xl text-sm">
            Hủy bỏ
          </button>
          <button 
            onClick={handleSubmit} disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Gửi xác minh'}
          </button>
        </div>

      </div>
    </div>
  );
};