import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, ChevronDown, ChevronUp, Store, 
  Utensils, Coffee, Gamepad2, GraduationCap, Building, 
  Home, Briefcase, Building2, UserCheck, Crown 
} from 'lucide-react';
import { UserStore } from '@/hooks/useUserStores'; 
import { useLanguage } from '@/i18n/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// 👇 Lấy link Backend
const API_URL = import.meta.env.VITE_API_URL;

// --- HÀM TÍNH KHOẢNG CÁCH (Haversine Formula) ---
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
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
  .mask-gradient {
    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
  }
`;

const ScrollingText = ({ text, className }: { text: string; className?: string }) => {
  const shouldScroll = text.length > 28;
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

interface MiniShowcaseProps {
  onSelectLocation: (loc: any) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export const MiniShowcase = ({ onSelectLocation, userLocation }: MiniShowcaseProps) => {
  const { language } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false); 
  const [activeTab, setActiveTab] = useState('food'); 
  
  const [stores, setStores] = useState<Record<string, (UserStore & { distance?: number })[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
      
        const response = await fetch(`${API_URL}/api/stores/approved`);
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Dữ liệu trả về không phải mảng:", data);
          setLoading(false);
          return;
        }

        // 2. Tính khoảng cách
        let processedData = data.map((store: any) => {
          let distance = 0;
          if (userLocation) {
            distance = calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng);
          }
          return { ...store, distance };
        });

        // 3. Sắp xếp: VIP -> Khoảng cách
        processedData.sort((a, b) => {
          if (a.is_premium && !b.is_premium) return -1;
          if (!a.is_premium && b.is_premium) return 1;
          return (a.distance || 0) - (b.distance || 0);
        });

        // 4. Phân nhóm
        const results: Record<string, any[]> = {};
        CATEGORIES.forEach(cat => results[cat.id] = []);

        processedData.forEach(store => {
          if (results[store.category]) {
            if (results[store.category].length < 10) { 
              results[store.category].push(store);
            }
          }
        });

        setStores(results);
      } catch (error) {
        console.error("Lỗi tải danh sách cửa hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userLocation]); 

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
      image: store.image_url,
      isUserStore: true 
    };
    onSelectLocation(standardizedLocation);
  };

  const currentStores = stores[activeTab] || [];

  return (
    <div className="absolute top-[112px] left-3 z-[30] flex flex-col items-start gap-2">
      <style>{marqueeStyle}</style>

      {/* Nút bật tắt Widget */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/95 backdrop-blur-md shadow-lg border rounded-full px-3 py-2 text-xs font-bold flex items-center gap-2 hover:bg-white transition-all text-primary group active:scale-95"
      >
        <div className="bg-primary/10 p-1 rounded-full group-hover:bg-primary/20 transition-colors">
            <Store className="w-3.5 h-3.5 text-primary" />
        </div>
        {language === 'vi' ? 'Gợi ý gần đây' : 'Nearby Suggestions'}
        {isOpen ? <ChevronUp className="w-3 h-3 text-gray-400"/> : <ChevronDown className="w-3 h-3 text-gray-400"/>}
      </button>

      {/* Nội dung bảng */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10, height: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, scale: 0.95, y: -10, height: 0 }}
            className="w-[300px] md:w-[320px] max-h-[60vh] bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 overflow-hidden flex flex-col origin-top-left"
          >
            {/* Header Tabs */}
            <div className="border-b bg-gray-50/80">
                <div 
                  className="flex overflow-x-auto p-2 gap-1.5"
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
                            : "text-gray-500 hover:bg-gray-200/50 hover:text-gray-700 bg-transparent"
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
                  [1,2,3].map(i => (
                    <div key={i} className="flex gap-3 items-center p-2">
                       <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                       <div className="space-y-2 flex-1">
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-2 w-1/2" />
                       </div>
                    </div>
                  ))
                ) : currentStores.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                    <Store className="w-10 h-10 opacity-20" />
                    <span className="text-xs">Không tìm thấy địa điểm nào</span>
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
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleItemClick(store)}
                        className={cn(
                          "flex gap-3 p-2 rounded-lg transition-all cursor-pointer border group relative overflow-hidden",
                          isVip 
                            ? "bg-gradient-to-r from-yellow-50 to-white border-yellow-200/60 hover:border-yellow-300" 
                            : "bg-white/60 border-transparent hover:bg-white hover:shadow-sm hover:border-gray-100"
                        )}
                      >
                        <div className="w-14 h-14 flex-shrink-0 relative">
                          <img 
                            src={store.image_url || 'https://placehold.co/100x100?text=Store'} 
                            className="w-full h-full object-cover rounded-md bg-gray-100 border border-gray-100"
                            loading="lazy"
                            onError={e => e.currentTarget.src='https://placehold.co/100x100?text=Store'}
                          />
                          {isVip && (
                            <div className="absolute -top-1.5 -left-1.5 z-10">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500 border border-white"></span>
                                </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                          <div className="flex justify-between items-start gap-1">
                             <div className="flex-1 min-w-0">
                               <ScrollingText 
                                 text={name} 
                                 className={cn(
                                   "text-xs font-bold transition-colors",
                                   isVip ? "text-yellow-800" : "text-gray-800 group-hover:text-primary"
                                 )}
                               />
                             </div>
                             {distanceText && (
                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full whitespace-nowrap border border-blue-100">
                                   {distanceText}
                                </span>
                             )}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <MapPin className="w-2.5 h-2.5 flex-shrink-0 text-gray-400" />
                            <p className="text-[10px] truncate w-full">{address}</p>
                          </div>
                          {isVip && (
                            <div className="flex gap-1 mt-1">
                              <span className="text-[8px] text-yellow-700 font-bold bg-gradient-to-r from-yellow-100 to-transparent pl-1 pr-2 rounded-sm flex items-center gap-1">
                                <Crown className="w-2 h-2 fill-yellow-700" />
                                VIP Partner
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                     );
                  })
                )}
                <div className="h-2"></div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};