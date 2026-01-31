import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, MapPin, X, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth'; // Đã chuyển sang Firebase
import { toast } from 'sonner';

// 👇 Lấy link Backend
const API_URL = import.meta.env.VITE_API_URL;

// Hàm tính khoảng cách
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface NearbyVoucherBannerProps {
  userLocation: { lat: number; lng: number } | null;
  onViewStore: (lat: number, lng: number) => void;
}

export const NearbyVoucherBanner = ({ userLocation, onViewStore }: NearbyVoucherBannerProps) => {

  const { user } = useAuth(); // ✅ Đổi session thành user (cho khớp Firebase)
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userLocation) return;

    const fetchData = async () => {
      try {
        // 1. Gọi API lấy voucher active
        const res = await fetch(`${API_URL}/api/vouchers/active`);
        const data = await res.json();

        if (!Array.isArray(data)) return;

        // 2. Map dữ liệu & Tính khoảng cách
        const nearby = data
          .map((v: any) => ({
            id: v.id,
            code: v.code,
            discount_value: v.discount_value,
            discount_type: v.discount_type,
            // Gom nhóm thông tin store lại cho giống cấu trúc cũ
            store: {
              id: v.store_id,
              name_vi: v.store_name,
              lat: v.store_lat,
              lng: v.store_lng,
              address_vi: v.address_vi
            },
            distance: calculateDistance(userLocation.lat, userLocation.lng, v.store_lat, v.store_lng)
          }))
          .filter((v) => v.distance <= 10) // Chỉ lấy quán < 10km
          .sort((a, b) => a.distance - b.distance);

        setVouchers(nearby);

        // 3. Nếu đã đăng nhập, lấy danh sách voucher đã lưu
        if (user) {
          const resSaved = await fetch(`${API_URL}/api/user-vouchers?userId=${user.uid}`);
          const savedData = await resSaved.json();
          
          if (Array.isArray(savedData)) {
            // savedData trả về có trường voucher_id hoặc id của bảng user_saved_vouchers
            // API user-vouchers ở bước trước trả về cấu trúc join, ta cần lấy ID của voucher gốc
            const ids = savedData.map((s: any) => s.voucher_id || s.id); 
            setSavedIds(new Set(ids));
          }
        }
      } catch (error) {
        console.error("Lỗi tải voucher:", error);
      }
    };

    fetchData();
  }, [userLocation, user]);

  // Tự động chuyển slide
  useEffect(() => {
    if (vouchers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % vouchers.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [vouchers]);

  const handleSaveVoucher = async (e: React.MouseEvent, voucher: any) => {
    e.stopPropagation();

    if (!user) {
      toast.error("Bạn cần đăng nhập để lưu mã!");
      return;
    }

    // Optimistic Update (Cập nhật giao diện trước cho mượt)
    if (savedIds.has(voucher.id)) return;
    setSavedIds(prev => new Set(prev).add(voucher.id));
    toast.success("Đã lưu mã vào ví!");

    try {
      const res = await fetch(`${API_URL}/api/vouchers/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          voucherId: voucher.id
        })
      });

      if (!res.ok) throw new Error('Failed');

    } catch (err) {
      // Rollback nếu lỗi
      setSavedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(voucher.id);
        return newSet;
      });
      toast.error("Lỗi kết nối, vui lòng thử lại");
    }
  };

  if (!isVisible || vouchers.length === 0) return null;

  const currentVoucher = vouchers[currentIndex];
  const isSaved = savedIds.has(currentVoucher.id);

  return (
    // VỊ TRÍ: Góc TRÁI dưới (bottom-2 left-2)
    <div className="fixed bottom-2 left-2 z-[40] w-[90%] md:w-80">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: -50, opacity: 0 }} // Trượt từ trái sang
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => onViewStore(currentVoucher.store.lat, currentVoucher.store.lng)}
          className="bg-white/95 backdrop-blur shadow-xl rounded-xl border border-gray-200 overflow-hidden relative cursor-pointer hover:shadow-2xl transition-all"
        >
          {/* Nút tắt */}
          <button 
            onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
            className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600 rounded-full z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex">
            {/* Cột trái: Ảnh minh họa hoặc Icon */}
            <div className="w-16 bg-gradient-to-b from-primary to-blue-600 flex items-center justify-center text-white flex-col gap-1">
               <Ticket className="w-6 h-6" />
               <span className="text-[10px] font-bold">Voucher</span>
            </div>

            {/* Cột phải: Nội dung */}
            <div className="flex-1 p-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase truncate mb-0.5">
                {currentVoucher.store.name_vi}
              </h4>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-xl font-black text-primary">
                  -{currentVoucher.discount_value}{currentVoucher.discount_type === 'percent' ? '%' : 'k'}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  #{currentVoucher.code}
                </span>
              </div>

              <div className="flex justify-between items-center mt-1">
                 <div className="flex items-center text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    <MapPin className="w-3 h-3 mr-1" />
                    {currentVoucher.distance.toFixed(1)}km
                 </div>

                 {/* Nút Lưu */}
                 <Button 
                    size="sm" 
                    variant={isSaved ? "outline" : "default"}
                    className={`h-7 text-xs px-2 ${isSaved ? 'text-green-600 border-green-200 bg-green-50' : ''}`}
                    onClick={(e) => handleSaveVoucher(e, currentVoucher)}
                 >
                    {isSaved ? <Check className="w-3 h-3 mr-1"/> : <Save className="w-3 h-3 mr-1"/>}
                    {isSaved ? "Đã lưu" : "Lưu"}
                 </Button>
              </div>
            </div>
          </div>
          
          {/* Thanh thời gian chạy */}
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, ease: "linear" }}
            className="h-1 bg-primary/50 absolute bottom-0 left-0"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};