import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Navigation, Clock, Phone, MapPin, Star, Ticket, ArrowRight, Loader2, Heart, Crown, Building, ArrowRightCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Location, Department } from '@/data/locations';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';
import { StoreDetailModal } from '@/components/store/StoreDetailModal';
import { StoreFormModal } from '@/components/store/StoreFormModal';

// 👇 Lấy đường dẫn Backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL;

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
  onClaim?: (location: Location) => void;
}

export const BottomSheet = ({ 
  location, 
  onClose, 
  onNavigate,
  onOpenDetail,
  onClaim
}: BottomSheetProps) => {
  const { language } = useLanguage();
  const { user } = useAuth(); 
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(location.id);

  const isVip = (location as any).is_premium;
  
  // Xác định loại ID
  const idStr = String(location.id);
  const isUserStore = idStr.startsWith('user-store-') || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr);
  const isMapboxLocation = !isUserStore;

  const rawId = idStr.replace('user-store-', '');

  const [ratingData, setRatingData] = useState({ rating: 0, count: 0 });
  const [isFetchingRating, setIsFetchingRating] = useState(false);
  
  // State cho sub-stores
  const [subStores, setSubStores] = useState<any[]>([]);
  const [isAddingToBuilding, setIsAddingToBuilding] = useState(false);
  
  // 🔥 Biến này quan trọng: Kiểm tra xem có phải tòa nhà không
  const isBuilding = location.category === 'building' || (location as any).type === 'building';

  // 👇 [QUAN TRỌNG] State xử lý việc "Hợp thức hóa" tòa nhà (Auto-import)
  const [isPreparingBuilding, setIsPreparingBuilding] = useState(false);
  const [targetBuildingId, setTargetBuildingId] = useState<string>("");

  // --- Fetch Rating ---
  useEffect(() => {
    const fetchRealRating = async (forceUpdate = false) => {
      if (!forceUpdate && location.reviews && location.reviews.length > 0) {
        const total = location.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0);
        setRatingData({
          rating: Number((total / location.reviews.length).toFixed(1)),
          count: location.reviews.length
        });
        return;
      }
      if (isMapboxLocation && !forceUpdate) return;

      setIsFetchingRating(true);
      try {
        const res = await fetch(`${API_URL}/api/reviews/${rawId}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
           const total = data.reduce((a: any, b: any) => a + b.rating, 0);
           setRatingData({
               rating: Number((total / data.length).toFixed(1)),
               count: data.length
           });
        } else {
           if (!forceUpdate && location.rating) {
               setRatingData({ rating: location.rating, count: location.reviews?.length || 0 });
           } else {
               setRatingData({ rating: 0, count: 0 });
           }
        }
      } catch (err) { console.error("Lỗi tải rating:", err); } 
      finally { setIsFetchingRating(false); }
    };
    fetchRealRating(); 

    const handleReviewUpdate = (event: any) => {
      if (String(event.detail) === String(rawId)) fetchRealRating(true);
    };
    window.addEventListener('review_updated', handleReviewUpdate);
    return () => window.removeEventListener('review_updated', handleReviewUpdate);
  }, [location.id, rawId, isMapboxLocation]);

  // --- Fetch Sub-stores (Các cửa hàng trong tòa nhà) ---
  useEffect(() => {
    // Chỉ fetch nếu là Tòa nhà VÀ đã nằm trong DB (ID là số hoặc UUID)
    // Để tránh lỗi 404 với ID kiểu "E5"
    const isDbId = /^\d+$/.test(rawId) || /^[0-9a-f-]{36}$/.test(rawId);

    if (isBuilding && !isMapboxLocation && isDbId) {
        fetch(`${API_URL}/api/stores/${rawId}/sub-stores`)
            .then(async (res) => {
                if(!res.ok) return []; // Tránh lỗi cú pháp JSON
                return res.json();
            })
            .then(data => {
                if(Array.isArray(data)) setSubStores(data);
                else setSubStores([]);
            })
            .catch(console.error);
    } else {
        setSubStores([]);
    }
  }, [location.id, isBuilding, rawId, isMapboxLocation]);

  // --- Fetch Vouchers ---
  const [storeVouchers, setStoreVouchers] = useState<any[]>([]);
  const [savedVoucherIds, setSavedVoucherIds] = useState<Set<string>>(new Set());
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [showDetailLocal, setShowDetailLocal] = useState(false);
  const [isNavigatingBtn, setIsNavigatingBtn] = useState(false);

  useEffect(() => {
    const fetchVouchers = async () => {
      if (isMapboxLocation) { setStoreVouchers([]); return; }
      setLoadingVouchers(true);
      try {
        const resVouchers = await fetch(`${API_URL}/api/store-vouchers/${rawId}`);
        const vouchers = await resVouchers.json();

        if (Array.isArray(vouchers) && vouchers.length > 0) {
          setStoreVouchers(vouchers);
          if (user) {
            const resSaved = await fetch(`${API_URL}/api/user-vouchers?userId=${user.uid}`);
            const savedData = await resSaved.json();
            if (Array.isArray(savedData)) {
              const savedSet = new Set(savedData.map((s: any) => s.voucher_id || s.id));
              setSavedVoucherIds(savedSet);
            }
          }
        } else { setStoreVouchers([]); }
      } catch (err) { console.error("Lỗi tải voucher:", err); } 
      finally { setLoadingVouchers(false); }
    };
    fetchVouchers();
  }, [location.id, rawId, user, isMapboxLocation]);

  const handleSaveVoucher = async (voucher: any) => {
    if (!user) { toast.error("Vui lòng đăng nhập để lưu ưu đãi!"); return; }
    if (savedVoucherIds.has(voucher.id)) return;
    setSavedVoucherIds(prev => new Set(prev).add(voucher.id));
    toast.success("Đã lưu ưu đãi vào ví!");
    try {
      await fetch(`${API_URL}/api/vouchers/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, voucherId: voucher.id })
      });
    } catch (error) {
       setSavedVoucherIds(prev => { const newSet = new Set(prev); newSet.delete(voucher.id); return newSet; });
       toast.error("Lỗi khi lưu, vui lòng thử lại.");
    }
  };

  const handleDirectionClick = () => {
    setIsNavigatingBtn(true);
    setTimeout(() => { onNavigate(location); setIsNavigatingBtn(false); }, 500); 
  };
  
  const handleShowDetail = () => {
    if (onOpenDetail) onOpenDetail(location);
    else setShowDetailLocal(true);
  };

  const handleSubStoreClick = (subStore: any) => {
    if (onOpenDetail) onOpenDetail(subStore);
  };

  const handleAddedSubStore = async () => {
      // Dùng targetBuildingId nếu vừa tạo mới, hoặc rawId nếu đã có sẵn
      const fetchId = targetBuildingId || rawId;
      if (!fetchId) return;

      const res = await fetch(`${API_URL}/api/stores/${fetchId}/sub-stores`);
      const data = await res.json();
      if(Array.isArray(data)) setSubStores(data);
  };

  // 🔥 [CỰC KỲ QUAN TRỌNG] Hàm xử lý khi bấm nút "Thêm địa điểm"
  const handleClickAddSubStore = async () => {
      if (!user) {
         toast.error("Vui lòng đăng nhập để thực hiện");
         return;
      }

      // 1. Kiểm tra xem ID hiện tại có phải là ID chuẩn trong DB không (số hoặc UUID)
      const isDbId = /^\d+$/.test(rawId) || /^[0-9a-f-]{36}$/.test(rawId) || String(location.id).startsWith('user-store-');
      
      if (isDbId) {
          // Đã là store trong DB, dùng luôn ID đó
          setTargetBuildingId(rawId);
          setIsAddingToBuilding(true);
          return;
      }

      // 2. Nếu là Mapbox/Hardcode ID (ví dụ "E5", "G3"), cần lưu vào DB trước để lấy ID thật
      setIsPreparingBuilding(true);
      try {
          const formData = new FormData();
          formData.append('userId', user.uid);
          formData.append('name_vi', locationName || '');
          formData.append('address_vi', location.address || '');
          formData.append('lat', String(location.lat));
          formData.append('lng', String(location.lng));
          formData.append('category', 'building'); // Force category là building
          formData.append('is_premium', 'false');
          formData.append('image_url', location.image || '');
          
          const res = await fetch(`${API_URL}/api/stores/save`, {
              method: 'POST',
              body: formData
          });

          if (!res.ok) throw new Error("Lỗi server khi tạo toà nhà");

          const data = await res.json();
          if (data.success && data.id) {
              console.log("Đã tạo toà nhà mới với ID:", data.id);
              setTargetBuildingId(String(data.id));
              setIsAddingToBuilding(true); // Mở form sau khi đã có ID thật
              toast.success("Đã kích hoạt tính năng toà nhà thành công!");
          }
      } catch (error) {
          console.error(error);
          toast.error("Không thể khởi tạo dữ liệu cho tòa nhà này.");
      } finally {
          setIsPreparingBuilding(false);
      }
  };
  
  const locationName = language === 'en' && location.name ? location.name : location.nameVi;
  const description = language === 'en' && location.descriptionEn ? location.descriptionEn : location.description;
  const categoryLabel = CATEGORY_LABELS[location.category || location.type] || 'Địa điểm';

  return (
    <>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[60] max-h-[85vh] overflow-y-auto md:max-w-md md:left-auto md:right-4 md:bottom-4 md:rounded-3xl border border-gray-100 scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* DRAG HANDLE */}
        <div 
            className="absolute top-0 left-0 right-0 h-6 flex justify-center items-center z-20 cursor-pointer md:hidden"
            onClick={onClose} 
        >
            <div className="w-12 h-1.5 bg-white/80 rounded-full shadow-sm backdrop-blur-md border border-gray-200/50"></div>
        </div>

        {/* HEADER ẢNH */}
        <div className="relative h-48 w-full bg-gray-200 cursor-pointer group" onClick={handleShowDetail}>
          <img 
            src={location.image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24'} 
            alt={locationName} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            loading="eager"
            onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=No+Image"; }} 
          />
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="absolute top-4 right-4 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-4 left-4 flex gap-2 z-10">
             <div className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold rounded-full uppercase tracking-wider text-gray-800 shadow-sm border border-white/50">
                {categoryLabel}
             </div>
             {isVip && (
                <div className="px-2 py-1 bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm border border-white/50 animate-pulse">
                   <Crown className="w-3 h-3 fill-yellow-900" />
                   VIP
                </div>
             )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        <div className="p-6 pb-24 md:pb-6 relative">
          <div className="flex justify-between items-start mb-2 gap-3">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight flex-1 line-clamp-2" onClick={handleShowDetail}>
               {locationName} 
            </h2>
            
            <div className="flex flex-col items-end gap-2 shrink-0">
               {isFetchingRating ? (
                 <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                    <Loader2 className="w-3 h-3 animate-spin text-gray-400"/>
                    <span className="text-[10px] text-gray-400">Loading...</span>
                 </div>
               ) : Number(ratingData.rating) > 0 ? (
                 <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-sm text-yellow-700">{ratingData.rating}</span>
                    <span className="text-[10px] text-gray-400">({ratingData.count})</span>
                 </div>
               ) : (
                 <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-medium">Chưa có đánh giá</span>
                 </div>
               )}

               <button 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(location); }}
                  className="p-2 rounded-full hover:bg-red-50 active:scale-95 transition-all group"
               >
                  <Heart className={`w-5 h-5 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-red-400'}`} />
               </button>
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-gray-600 mb-6">
            <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
            <p className="text-sm font-medium">{location.address || 'Đang cập nhật địa chỉ...'}</p>
          </div>

          <div className="mb-6">
            <Button 
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl transition-transform active:scale-[0.98]" 
              onClick={handleDirectionClick}
              disabled={isNavigatingBtn}
            >
              {isNavigatingBtn ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Navigation className="w-5 h-5 mr-2" />}
              {isNavigatingBtn ? "Đang tìm đường..." : "Chỉ đường đến đây"}
            </Button>
          </div>

          {/* 👇 DANH SÁCH ĐỊA ĐIỂM TRONG TÒA NHÀ (NẾU CÓ) */}
          {isBuilding && (
            <div className="mb-6 space-y-3 pt-4 border-t border-dashed">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase">
                        <Building className="w-4 h-4 text-blue-600"/> 
                        Bên trong tòa nhà ({subStores.length})
                    </h3>
                    
                    {/* 👇 Nút thêm địa điểm đã được cập nhật logic */}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 text-xs font-bold hover:bg-blue-50 h-8 gap-2"
                        onClick={handleClickAddSubStore}
                        disabled={isPreparingBuilding}
                    >
                         {isPreparingBuilding ? (
                            <><Loader2 className="w-3 h-3 animate-spin"/> Đang khởi tạo...</>
                         ) : (
                            "+ Thêm địa điểm"
                         )}
                    </Button>
                </div>

                {subStores.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed text-gray-400 text-xs">
                        Chưa có địa điểm nào bên trong. <br/>
                        Hãy là người đầu tiên đóng góp!
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {subStores.map((store) => (
                            <div 
                                key={store.id}
                                onClick={() => handleSubStoreClick(store)}
                                className="flex items-center gap-3 p-2 bg-white border rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                    <img 
                                        src={store.image_url || 'https://placehold.co/100x100'} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=IMG"; }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-gray-900 truncate group-hover:text-blue-600">
                                        {store.name_vi}
                                    </h4>
                                    <p className="text-xs text-gray-500 capitalize">{CATEGORY_LABELS[store.category] || store.category}</p>
                                </div>
                                <ArrowRightCircle className="w-4 h-4 text-gray-300 group-hover:text-blue-500"/>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}

          {isMapboxLocation && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm"><Crown size={16} /></div>
                <div>
                  <p className="text-sm font-bold text-blue-900">Bạn là chủ địa điểm này?</p>
                  <p className="text-xs text-blue-600 mt-0.5">Xác minh ngay để quản lý thông tin, hình ảnh và tạo ưu đãi.</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full bg-white text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white h-10 text-xs font-bold rounded-xl transition-all"
                onClick={() => onClaim?.(location)}
              >
                Xác nhận chủ sở hữu
              </Button>
            </div>
          )}

          {/* ... (Phần Vouchers và Info giữ nguyên) ... */}
          {loadingVouchers ? (
             <div className="h-20 bg-gray-50 rounded-xl mb-6 flex items-center justify-center border border-dashed border-gray-200">
               <Loader2 className="w-4 h-4 animate-spin text-gray-300"/>
             </div>
          ) : storeVouchers.length > 0 && (
            <div className="mb-6 space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                <Ticket className="w-4 h-4 text-orange-500" /> Ưu đãi đang có ({storeVouchers.length})
              </h3>
              {storeVouchers.slice(0, 2).map((v) => {
                const isSaved = savedVoucherIds.has(v.id);
                return (
                  <div key={v.id} className="group relative border border-orange-100 bg-gradient-to-r from-orange-50 to-white rounded-xl p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 bg-white text-orange-600 rounded-lg flex items-center justify-center font-bold text-sm flex-col shadow-sm border border-orange-100 shrink-0">
                        <span>{v.discount_value}</span>
                        <span className="text-[10px] leading-none">{v.discount_type === 'percent' ? '%' : 'k'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate pr-2">{v.title_vi}</p>
                        <p className="text-[10px] text-gray-500 font-mono bg-white inline-block px-1 rounded border border-gray-100">Code: {v.code}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant={isSaved ? "ghost" : "default"} 
                      className={`h-8 px-3 text-xs rounded-lg font-bold shrink-0 transition-all ${
                        isSaved 
                        ? 'text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 shadow-md'
                      }`} 
                      onClick={() => handleSaveVoucher(v)} 
                      disabled={isSaved}
                    >
                      {isSaved ? "Đã lưu" : "Lưu"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>08:00 - 22:00 (Mở cửa)</span>
            </div>
            {location.phone && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${location.phone}`} className="hover:text-primary transition-colors">{location.phone}</a>
              </div>
            )}
          </div>

          {description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{description}</p>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 rounded-b-3xl md:rounded-b-3xl z-20">
             <Button 
              variant="secondary" 
              className="w-full h-12 font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 border-none shadow-sm flex items-center justify-center gap-2 rounded-xl" 
              onClick={handleShowDetail}
            >
                {isVip ? "Xem Menu & Ảnh cửa hàng" : "Xem chi tiết đầy đủ"} 
                <ArrowRight className="w-4 h-4"/>
             </Button>
          </div>
        </div>
      </motion.div>

      <StoreDetailModal 
        isOpen={showDetailLocal} 
        onClose={() => setShowDetailLocal(false)} 
        location={location} 
      />

      {/* 👇 FORM THÊM CỬA HÀNG CON - ĐÃ NHẬN ĐÚNG ID TÒA NHÀ THẬT */}
      <StoreFormModal
        isOpen={isAddingToBuilding}
        onClose={() => setIsAddingToBuilding(false)}
        onSubmit={handleAddedSubStore}
        // 🔥 Ưu tiên dùng targetBuildingId (vừa tạo) hơn rawId (có thể là E5 lỗi)
        parentBuildingId={targetBuildingId || ( /^\d+$/.test(rawId) ? rawId : undefined )}
        initialData={{
            lat: location.lat, 
            lng: location.lng,
            address_vi: location.address || location.address_vi 
        }}
      />
    </>
  );
};