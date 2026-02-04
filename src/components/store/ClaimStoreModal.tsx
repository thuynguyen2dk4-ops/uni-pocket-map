import { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth(); 
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    role: 'Chủ sở hữu',
    message: ''
  });
  
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  // 🔥 FIX LỖI LOOP ẢNH: Lưu URL preview vào state riêng
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Reset form và tạo preview URL an toàn
  useEffect(() => {
    if (isOpen) {
      setFormData({ 
        phone: '', 
        role: 'Chủ sở hữu', 
        message: '',
        email: user?.email || '' 
      });
      setProofFiles([]);
      setPreviewUrls([]);
    }
  }, [isOpen, user]);

  // 🔥 FIX LỖI LOOP ẢNH: Chỉ tạo URL khi file thay đổi
  useEffect(() => {
    // 1. Tạo URLs mới
    const newUrls = proofFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newUrls);

    // 2. Cleanup function: Xóa URLs cũ để tránh rò rỉ bộ nhớ
    return () => {
      newUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [proofFiles]);

  if (!isOpen || !data) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (proofFiles.length + filesArray.length > 5) {
        toast.error("Tối đa 5 ảnh");
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
    if (proofFiles.length === 0) return toast.error("Cần ít nhất 1 ảnh bằng chứng");
    if (!user) return toast.error("Vui lòng đăng nhập");

    setIsLoading(true);

    try {
      const submitData = new FormData();
      // 🔥 QUAN TRỌNG: Gửi đúng tên field mà Backend chờ đợi
      submitData.append('userId', user.uid);
      submitData.append('storeId', String(data.mapboxId));
      submitData.append('storeName', data.name);
      submitData.append('storeAddress', data.address || '');
      submitData.append('lat', String(data.lat));
      submitData.append('lng', String(data.lng));
      submitData.append('phone', formData.phone);
      submitData.append('email', formData.email);
      submitData.append('role', formData.role);
      submitData.append('message', formData.message);

      proofFiles.forEach((file) => {
        submitData.append('proofFiles', file); 
      });

      // 🔥 FIX LỖI 400: Không set Content-Type header thủ công!
      const res = await fetch(`${API_URL}/api/claims/submit`, {
        method: 'POST',
        body: submitData, 
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Gửi thất bại");

      toast.success("Đã gửi xác minh thành công!");
      onClose();

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Lỗi kết nối");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg">Xác nhận chủ sở hữu</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Form inputs giữ nguyên... */}
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="text-sm font-medium">Vai trò *</label>
              <select className="w-full mt-1 p-2 border rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option>Chủ sở hữu</option>
                <option>Quản lý</option>
              </select>
             </div>
             <div>
               <label className="text-sm font-medium">SĐT *</label>
               <input className="w-full mt-1 p-2 border rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
             </div>
          </div>
          <div>
             <label className="text-sm font-medium">Email *</label>
             <input className="w-full mt-1 p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>

          {/* 🔥 PHẦN HIỂN THỊ ẢNH ĐÃ ĐƯỢC FIX LOOP */}
          <div>
            <label className="block text-sm font-medium mb-2">Ảnh bằng chứng *</label>
            <div className="grid grid-cols-4 gap-3">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded border overflow-hidden">
                  <img src={url} className="w-full h-full object-cover" alt="preview" />
                  <button type="button" onClick={() => removeFile(idx)} className="absolute top-0 right-0 bg-red-500 text-white p-1">
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {proofFiles.length < 5 && (
                <label className="border-2 border-dashed rounded flex items-center justify-center cursor-pointer aspect-square hover:bg-gray-50">
                  <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                  <Upload size={20} className="text-gray-400" />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Lời nhắn</label>
            <textarea className="w-full mt-1 p-2 border rounded" rows={3} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex gap-3">
          <button onClick={onClose} className="flex-1 p-2 border rounded bg-white">Hủy</button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex-1 p-2 bg-blue-600 text-white rounded flex justify-center items-center gap-2">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Gửi xác minh'}
          </button>
        </div>
      </div>
    </div>
  );
};