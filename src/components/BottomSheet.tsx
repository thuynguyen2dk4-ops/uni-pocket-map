import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Navigation, Clock, Phone, MapPin, Star, Ticket, ArrowRight, Loader2, Heart, Crown, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Location, Department } from '@/data/locations';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';
import { StoreDetailModal } from '@/components/store/StoreDetailModal';

// Bảng dịch danh mục sang Tiếng Việt hiển thị cho đẹp
const CATEGORY_LABELS: Record<string, string> = {
  food: 'Ẩm thực',
  cafe: 'Café',
  entertainment: 'Vui chơi',
  lecture_hall: 'Giảng đường',
  office: 'Văn phòng',
  housing: 'Nhà trọ',
  job: 'Việc làm',
  building: 'Tòa nhà',
  checkin: 'Check-in',
};

interface BottomSheetProps {
  location: Location;
  department: Department | null;
  onClose: () => void;
  onNavigate: (location: Location) => void;
  onLoginClick?: () => void;
  onPromoteClick?: (location: Location) => void;
  onOpenDetail?: (location: Location) => void;
}

export const BottomSheet = ({ 
  location, 
  onClose, 
  onNavigate,
  onOpenDetail
}: BottomSheetProps) => {
  const { language } = useLanguage();
  const { session } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(location.id);

  // Kiểm tra VIP (Dùng cột is_premium mới)
  const isVip = (location as any).is_premium;

  // Logic tính điểm đánh giá (SỬA LỖI: Không default 4.5 nữa)
  const { rating, count } = useMemo(() => {
    if (location.reviews && location.reviews.length > 0) {
       const total = location.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0);
       return {
         rating: (total / location.reviews.length).toFixed(1),
         count: location.reviews.length
       };
    }
    // Nếu có rating sẵn trong DB thì lấy, không thì trả về 0 (Mới)
    return { 
      rating: location.rating || 0, 
      count: location.reviews?.length || 0 
    };
  }, [location]);

  const [storeVouchers, setStoreVouchers] = useState<any[]>([]);
  const [savedVoucherIds, setSavedVoucherIds] = useState<Set<string>>(new Set());
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [showDetailLocal, setShowDetailLocal] = useState(false);
  const [isNavigatingBtn, setIsNavigatingBtn] = useState(false);

  useEffect(() => {
    const fetchVouchers = async () => {
      // Kiểm tra xem ID có phải UUID không (để tránh lỗi với dữ liệu fake cũ)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(location.id));
      if (!isUUID) { setStoreVouchers([]); return; }

      setLoadingVouchers(true);
      const { data: vouchers } = await supabase.from('store_vouchers').select('*').eq('store_id', location.id).eq('is_active', true);
      if (vouchers && vouchers.length > 0) {
        setStoreVouchers(vouchers);
        if (session?.user) {
          const ids = vouchers.map((v:any) => v.id);
          const { data: saved } = await supabase.from('user_saved_vouchers' as any).select('voucher_id').eq('user_id', session.user.id).in('voucher_id', ids);
          if (saved) setSavedVoucherIds(new Set(saved.map((s: any) => s.voucher_id)));
        }
      } else { setStoreVouchers([]); }
      setLoadingVouchers(false);
    };
    fetchVouchers();
  }, [location.id, session]);

  const handleSaveVoucher = async (voucher: any) => {
    if (!session?.user) { toast.error("Đăng nhập để lưu!"); return; }
    if (savedVoucherIds.has(voucher.id)) return;
    const { error } = await supabase.from('user_saved_vouchers' as any).insert({user_id: session.user.id, voucher_id: voucher.id});
    if (!error) { toast.success("Đã lưu!"); setSavedVoucherIds(prev => new Set(prev).add(voucher.id)); }
  };

  const handleDirectionClick = () => {
    setIsNavigatingBtn(true);
    onNavigate(location); 
  };
  
  const handleShowDetail = () => {
    if (onOpenDetail) onOpenDetail(location);
    else setShowDetailLocal(true);
  };
  
  const locationName = language === 'en' && location.name ? location.name : location.nameVi;
  const description = language === 'en' && location.descriptionEn ? location.descriptionEn : location.description;
  
  // Xác định tên danh mục hiển thị
  // location.category thường là 'lecture_hall', 'food'... -> Tra bảng CATEGORY_LABELS
  // Nếu không tìm thấy trong bảng thì hiển thị mặc định 'Địa điểm'
  const categoryLabel = CATEGORY_LABELS[location.category || location.type] || 'Địa điểm';

  return (
    <>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[60] max-h-[85vh] overflow-y-auto md:max-w-md md:left-auto md:right-4 md:bottom-4 md:rounded-3xl border border-gray-100"
      >
        {/* HEADER ẢNH */}
        <div className="relative h-48 w-full bg-gray-200 cursor-pointer" onClick={handleShowDetail}>
          <img 
            src={location.image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24'} 
            alt={locationName} 
            className="w-full h-full object-cover" 
            loading="lazy"
            onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=No+Image"; }} 
          />
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white backdrop-blur-sm"><X className="w-5 h-5" /></button>
          
          <div className="absolute bottom-4 left-4 flex gap-2">
             {/* LABEL DANH MỤC ĐÃ SỬA */}
             <div className="px-3 py-1 bg-white/90 backdrop-blur text-xs font-bold rounded-full uppercase tracking-wider text-gray-800 shadow-sm border border-white/50">
                {categoryLabel}
             </div>

             {/* HUY HIỆU VIP */}
             {isVip && (
                <div className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm animate-pulse border border-white">
                   <Crown className="w-3 h-3 fill-yellow-900" />
                   VIP
                </div>
             )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-2 gap-3">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight flex-1" onClick={handleShowDetail}>
               {locationName} 
            </h2>
            
            <div className="flex flex-col items-end gap-2 shrink-0">
               {/* SỬA LOGIC HIỂN THỊ SAO */}
               {Number(rating) > 0 ? (
                 <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-sm text-yellow-700">{rating}</span>
                    <span className="text-[10px] text-gray-400">({count})</span>
                 </div>
               ) : (
                 <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-medium">Chưa có đánh giá</span>
                 </div>
               )}

               <button 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(location); }}
                  className="p-1.5 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
               >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
               </button>
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-gray-600 mb-6"><MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-primary" /><p className="text-sm">{location.address || 'Đang cập nhật địa chỉ...'}</p></div>

          <div className="mb-6">
            <Button 
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl" 
              onClick={handleDirectionClick}
              disabled={isNavigatingBtn}
            >
              {isNavigatingBtn ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Navigation className="w-5 h-5 mr-2" />}
              {isNavigatingBtn ? "Đang xử lý..." : "Chỉ đường đến đây"}
            </Button>
          </div>

          {/* VOUCHERS */}
          {loadingVouchers ? (
             <div className="h-16 bg-gray-50 rounded-xl mb-6 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-gray-300"/></div>
          ) : storeVouchers.length > 0 && (
            <div className="mb-6 space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Ticket className="w-5 h-5 text-orange-500" /> Ưu đãi ({storeVouchers.length})</h3>
              {storeVouchers.slice(0, 2).map((v) => {
                const isSaved = savedVoucherIds.has(v.id);
                return (
                  <div key={v.id} className="border border-dashed border-orange-200 bg-orange-50/50 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white text-orange-600 rounded-lg flex items-center justify-center font-bold text-xs flex-col shadow-sm"><span>{v.discount_value}</span><span>{v.discount_type === 'percent' ? '%' : 'k'}</span></div>
                      <div><p className="font-bold text-sm text-gray-900 truncate max-w-[120px]">{v.title_vi}</p><p className="text-xs text-gray-500 font-mono">#{v.code}</p></div>
                    </div>
                    <Button size="sm" variant={isSaved ? "ghost" : "default"} className={`h-7 px-2 text-xs ${isSaved ? 'text-green-600 bg-green-100' : 'bg-orange-500 text-white'}`} onClick={() => handleSaveVoucher(v)} disabled={isSaved}>{isSaved ? "Đã có" : "Lưu"}</Button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-600"><Clock className="w-4 h-4 text-gray-400" /><span>08:00 - 22:00 (Mở cửa)</span></div>
            <div className="flex items-center gap-3 text-sm text-gray-600"><Phone className="w-4 h-4 text-gray-400" /><span>{location.phone || '0912 345 678'}</span></div>
          </div>

          {description && <div className="mt-4 pt-4 border-t border-gray-100"><p className="text-sm text-gray-600 line-clamp-2">{description}</p></div>}

          <div className="mt-6 pt-2 sticky bottom-0 bg-white pb-2 z-10">
             <Button variant="secondary" className="w-full h-12 font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 border-none shadow-sm flex items-center justify-center gap-2" onClick={handleShowDetail}>
                {isVip ? "Xem Menu & Ảnh cửa hàng" : "Xem chi tiết đầy đủ"} 
                <ArrowRight className="w-4 h-4"/>
             </Button>
          </div>
        </div>
      </motion.div>

      <StoreDetailModal isOpen={showDetailLocal} onClose={() => setShowDetailLocal(false)} location={location} />
    </>
  );
};