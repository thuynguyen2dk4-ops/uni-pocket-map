import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, ChevronDown, ChevronUp, Store, 
  Utensils, Coffee, Gamepad2, GraduationCap, Building, 
  Home, Briefcase, Building2, UserCheck, Crown, Navigation
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UserStore } from '@/hooks/useUserStores';
import { useLanguage } from '@/i18n/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// --- HÀM TÍNH KHOẢNG CÁCH (Haversine Formula) ---
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Trả về km
};

// --- STYLE CHO CHỮ CHẠY ---
const marqueeStyle = `
  @keyframes scroll-left {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-scroll {
    display: flex;
    white-space: nowrap;
    animation: scroll-left 10s linear infinite;
  }
  .group:hover .animate-scroll {
    animation-play-state: paused;
  }
`;

const ScrollingText = ({ text, className }: { text: string; className?: string }) => {
  const shouldScroll = text.length > 30;
  if (!shouldScroll) return <h4 className={`truncate ${className}`}>{text}</h4>;

  return (
    <div className="overflow-hidden w-full mask-gradient">
      <div className={`animate-scroll w-fit ${className}`}>
        <span className="mr-8">{text}</span>
        <span className="mr-8">{text}</span>
      </div>
    </div>
  );
};

// Danh mục
const CATEGORIES = [
  { id: 'food', icon: <Utensils className="w-3.5 h-3.5"/>, label: 'Ăn uống' },
  { id: 'cafe', icon: <Coffee className="w-3.5 h-3.5"/>, label: 'Café' },
  { id: 'entertainment', icon: <Gamepad2 className="w-3.5 h-3.5"/>, label: 'Vui chơi' },
  { id: 'lecture_hall', icon: <GraduationCap className="w-3.5 h-3.5"/>, label: 'Giảng đường' },
  { id: 'office', icon: <Building className="w-3.5 h-3.5"/>, label: 'Văn phòng' },
  { id: 'housing', icon: <Home className="w-3.5 h-3.5"/>, label: 'Nhà trọ' },
  { id: 'job', icon: <Briefcase className="w-3.5 h-3.5"/>, label: 'Việc làm' },
  { id: 'building', icon: <Building2 className="w-3.5 h-3.5"/>, label: 'Tòa nhà' },
  { id: 'checkin', icon: <UserCheck className="w-3.5 h-3.5"/>, label: 'Check-in' },
];

// --- CẬP NHẬT PROPS: THÊM USER LOCATION ---
interface MiniShowcaseProps {
  onSelectLocation: (loc: any) => void;
  userLocation?: { lat: number; lng: number } | null; // Thêm dòng này
}

export const MiniShowcase = ({ onSelectLocation, userLocation }: MiniShowcaseProps) => {
  const { language } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('food'); 
  
  const [stores, setStores] = useState<Record<string, (UserStore & { distance?: number })[]>>({});
  const [loading, setLoading] = useState(true);

  // --- THUẬT TOÁN MỚI ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // 1. Lấy TẤT CẢ các cửa hàng đã duyệt (không limit ở đây để tính khoảng cách chính xác)
      const { data, error } = await supabase
        .from('user_stores')
        .select('*')
        .eq('status', 'approved');

      if (error || !data) {
        console.error("Error fetching stores:", error);
        setLoading(false);
        return;
      }

      // 2. Tính khoảng cách và gán vào từng store
      let processedData = data.map((store: any) => {
        let distance = 0;
        if (userLocation) {
          distance = calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng);
        }
        return { ...store, distance };
      });

      // 3. Sắp xếp: Ưu tiên VIP trước -> Sau đó đến Gần Nhất
      processedData.sort((a, b) => {
        // Nếu a là VIP mà b không phải -> a lên trước
        if (a.is_premium && !b.is_premium) return -1;
        // Nếu b là VIP mà a không phải -> b lên trước
        if (!a.is_premium && b.is_premium) return 1;
        
        // Nếu cùng là VIP hoặc cùng là thường -> Ai gần hơn lên trước
        return (a.distance || 0) - (b.distance || 0);
      });

      // 4. Phân loại về các nhóm danh mục & Cắt lấy top 10 mỗi nhóm
      const results: Record<string, any[]> = {};
      
      // Khởi tạo mảng rỗng cho các cate để tránh lỗi undefined
      CATEGORIES.forEach(cat => results[cat.id] = []);

      processedData.forEach(store => {
        if (results[store.category]) {
          // Chỉ push nếu danh sách chưa đủ 10 (hoặc số lượng bạn muốn hiển thị)
          if (results[store.category].length < 10) {
            results[store.category].push(store);
          }
        }
      });

      setStores(results);
      setLoading(false);
    };

    fetchData();
  }, [userLocation]); // Chạy lại khi vị trí người dùng thay đổi

  const handleItemClick = (store: any) => {
    const standardizedLocation = {
      ...store,
      id: store.id,
      name: language === 'en' && store.name_en ? store.name_en : store.name_vi,
      nameVi: store.name_vi,
      address: language === 'en' && store.address_en ? store.address_en : store.address_vi,
      category: store.category,
      lat: store.lat,
      lng: store.lng,
      image: store.image_url
    };
    onSelectLocation(standardizedLocation);
    setIsOpen(false);
  };

  const currentStores = stores[activeTab] || [];

  return (
    <div className="absolute top-[112px] left-3 z-[30] flex flex-col items-start gap-2">
      <style>{marqueeStyle}</style>

      {/* Nút bật tắt Widget */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/95 backdrop-blur-md shadow-lg border rounded-full px-3 py-2 text-xs font-bold flex items-center gap-2 hover:bg-white transition-all text-primary group"
      >
        <div className="bg-primary/10 p-1 rounded-full group-hover:bg-primary/20 transition-colors">
            <Store className="w-3.5 h-3.5 text-primary" />
        </div>
        {language === 'vi' ? 'Gợi ý hôm nay' : 'Suggestions'}
        {isOpen ? <ChevronUp className="w-3 h-3 text-gray-400"/> : <ChevronDown className="w-3 h-3 text-gray-400"/>}
      </button>

      {/* Nội dung bảng */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10, height: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, scale: 0.95, y: -10, height: 0 }}
            className="w-[320px] max-h-[60vh] bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border overflow-hidden flex flex-col"
          >
            {/* Header Tabs */}
            <div className="border-b bg-gray-50/50">
                <div 
                  className="flex overflow-x-auto p-1.5 gap-1.5"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <style>{`.flex::-webkit-scrollbar { display: none; }`}</style>
                  
                  {CATEGORIES.map(cat => {
                    const isActive = activeTab === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={cn(
                          "flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap",
                          isActive 
                            ? "bg-white text-primary shadow-sm border ring-1 ring-gray-100" 
                            : "text-gray-500 hover:bg-gray-200/50 hover:text-gray-700"
                        )}
                      >
                        {cat.icon}
                        {cat.label}
                      </button>
                    )
                  })}
                </div>
            </div>

            {/* Body List */}
            <ScrollArea className="flex-1 w-full bg-white/50">
              <div className="p-2 space-y-2">
                {loading ? (
                  [1,2,3,4].map(i => (
                    <div key={i} className="flex gap-3 items-center p-2">
                       <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                       <div className="space-y-2 flex-1">
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-2 w-1/2" />
                       </div>
                    </div>
                  ))
                ) : currentStores.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                    <Store className="w-8 h-8 opacity-20" />
                    <span className="text-xs">Chưa có địa điểm nào</span>
                  </div>
                ) : (
                  currentStores.map(store => {
                     const name = language === 'en' && store.name_en ? store.name_en : store.name_vi;
                     const address = language === 'en' && store.address_en ? store.address_en : store.address_vi;
                     const isVip = store.is_premium;
                     
                     // Format khoảng cách
                     const distanceText = store.distance 
                        ? (store.distance < 1 
                            ? `${(store.distance * 1000).toFixed(0)}m` 
                            : `${store.distance.toFixed(1)}km`)
                        : '';

                     return (
                      <motion.div
                        key={store.id}
                        layoutId={String(store.id)}
                        onClick={() => handleItemClick(store)}
                        className={cn(
                          "flex gap-3 p-2 rounded-lg transition-all cursor-pointer border group relative",
                          isVip 
                            ? "bg-gradient-to-r from-yellow-50 to-white border-yellow-200 hover:border-yellow-300" 
                            : "bg-white/40 border-transparent hover:bg-white hover:shadow-md hover:border-gray-100"
                        )}
                      >
                        {/* ẢNH */}
                        <div className="w-14 h-14 flex-shrink-0 relative">
                          <img 
                            src={store.image_url || 'https://placehold.co/100x100?text=Store'} 
                            className="w-full h-full object-cover rounded-md bg-gray-200 border"
                            onError={e => e.currentTarget.src='https://placehold.co/100x100?text=Store'}
                          />
                          {isVip && (
                            <div className="absolute -top-2 -left-2">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                </span>
                            </div>
                          )}
                        </div>

                        {/* TEXT */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 overflow-hidden">
                          <div className="flex justify-between items-start">
                             <ScrollingText 
                               text={name} 
                               className={cn(
                                 "text-xs font-bold transition-colors w-[85%]",
                                 isVip ? "text-yellow-800" : "text-gray-800 group-hover:text-primary"
                               )}
                             />
                             {/* Hiển thị khoảng cách ở góc */}
                             {distanceText && (
                                <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1 rounded flex items-center whitespace-nowrap">
                                   {distanceText}
                                </span>
                             )}
                          </div>
                          
                          <div className="flex items-start gap-1 text-gray-500 overflow-hidden">
                            <MapPin className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                            <ScrollingText
                              text={address}
                              className="text-[10px] leading-tight text-gray-500"
                            />
                          </div>

                          {isVip && (
                            <div className="flex gap-1 mt-1">
                              <span className="text-[9px] text-yellow-700 font-bold bg-yellow-100 px-1.5 rounded-full border border-yellow-200 flex items-center gap-1 shadow-sm">
                                <Crown className="w-2 h-2 fill-yellow-700" />
                                Được đề xuất
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                     );
                  })
                )}
                <div className="h-4"></div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};