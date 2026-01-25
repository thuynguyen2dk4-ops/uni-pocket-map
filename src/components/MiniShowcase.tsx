import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Star, ChevronDown, ChevronUp, Store, 
  Utensils, Coffee, Gamepad2, GraduationCap, Building, 
  Home, Briefcase, Building2, UserCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UserStore } from '@/hooks/useUserStores';
import { useLanguage } from '@/i18n/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

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

export const MiniShowcase = ({ onSelectLocation }: { onSelectLocation: (loc: any) => void }) => {
  const { language } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('food'); 
  
  const [stores, setStores] = useState<Record<string, UserStore[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const results: Record<string, UserStore[]> = {};
      await Promise.all(CATEGORIES.map(async (cat) => {
        const { data } = await supabase
          .from('user_stores')
          .select('*')
          .eq('category', cat.id)
          .eq('status', 'approved')
          .order('is_premium', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(10);
        if (data) results[cat.id] = data as UserStore[];
      }));
      setStores(results);
      setLoading(false);
    };
    fetchData();
  }, []);
useEffect(() => {
    const fetchData = async () => {
      const results: Record<string, UserStore[]> = {};
      const now = new Date().toISOString(); // Lấy thời gian hiện tại

      await Promise.all(CATEGORIES.map(async (cat) => {
        const { data } = await supabase
          .from('user_stores')
          .select('*')
          .eq('category', cat.id)
          .eq('status', 'approved')
          // --- LỌC QUẢNG CÁO ---
          // Chỉ lấy cửa hàng có hạn quảng cáo > bây giờ
          .gt('ad_expiry', now) 
          .order('is_premium', { ascending: false })
          .limit(10);
          
        if (data && data.length > 0) {
            results[cat.id] = data as UserStore[];
        }
      }));
      setStores(results);
      setLoading(false);
    };
    fetchData();
}, []);
  const handleItemClick = (store: UserStore) => {
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
    // CẬP NHẬT: top-[112px] để nằm ngay dưới hàng nút lọc
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
            {/* Header Tabs (Ẩn thanh cuộn) */}
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

                     return (
                      <motion.div
                        key={store.id}
                        layoutId={store.id}
                        onClick={() => handleItemClick(store)}
                        className="flex gap-3 p-2 rounded-lg hover:bg-white hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-gray-100 group bg-white/40"
                      >
                        <div className="w-14 h-14 flex-shrink-0 relative">
                          <img 
                            src={store.image_url || 'https://placehold.co/100x100?text=Store'} 
                            className="w-full h-full object-cover rounded-md bg-gray-200 border"
                            onError={e => e.currentTarget.src='https://placehold.co/100x100?text=Store'}
                          />
                          {(store as any).is_premium && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 p-0.5 rounded-full shadow-sm z-10">
                              <Star className="w-2 h-2 fill-current" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 overflow-hidden">
                          <ScrollingText 
                             text={name} 
                             className="text-xs font-bold text-gray-800 group-hover:text-primary transition-colors"
                          />
                          
                          <div className="flex items-start gap-1 text-gray-500 overflow-hidden">
                            <MapPin className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                            <ScrollingText
                              text={address}
                              className="text-[10px] leading-tight text-gray-500"
                            />
                          </div>

                          {(store as any).is_premium && (
                            <span className="text-[9px] text-yellow-600 font-semibold bg-yellow-50 w-fit px-1.5 rounded-full border border-yellow-100 mt-0.5">
                              VIP
                            </span>
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