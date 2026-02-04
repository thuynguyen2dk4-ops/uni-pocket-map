import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, MapPin, Star, Ticket, Clock, Utensils, Image as ImageIcon, Check, Phone, Loader2, Edit3, Info } from 'lucide-react';
import { Location } from '@/data/locations';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ReviewSection } from './ReviewSection';
import { StoreFormModal } from './StoreFormModal';

// 👇 Lấy link Backend
const API_URL = import.meta.env.VITE_API_URL;

interface StoreDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
  onNavigate?: () => void;
}

export const StoreDetailModal = ({ isOpen, onClose, location, onNavigate }: StoreDetailModalProps) => {
  if (!location) return null;

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  
  const [displayData, setDisplayData] = useState<any>(location);
  
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [savedVoucherIds, setSavedVoucherIds] = useState<Set<string>>(new Set());
  
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const rawId = String(location.id).replace('user-store-', '');

  // Logic phân quyền đơn giản
  const isOwner = displayData?.user_id === user?.uid;
  const canEdit = isOwner || user?.email === "admin@gmail.com";

  useEffect(() => {
    if (isOpen && location) {
      fetchMergedData();
    }
  }, [isOpen, location.id, user]);

  const fetchMergedData = async () => {
    setLoading(true);
    
    try {
      // 1. Gọi API lấy thông tin chi tiết Store từ DB
      const resStore = await fetch(`${API_URL}/api/stores/${rawId}/public`);
      const dbStore = await resStore.json();

      // Ưu tiên dữ liệu từ DB, nếu null thì dùng dữ liệu local/mapbox truyền vào
      const finalData = dbStore || location;
      setDisplayData(finalData);

      // 2. Fetch dữ liệu liên quan song song (Parallel Fetching)
      const [menuRes, galleryRes, voucherRes, reviewsRes] = await Promise.all([
        fetch(`${API_URL}/api/stores/${rawId}/menu`),           
        fetch(`${API_URL}/api/stores/${rawId}/gallery`),        
        fetch(`${API_URL}/api/store-vouchers/${rawId}`),        
        fetch(`${API_URL}/api/reviews/list/${rawId}`)           
      ]);

      const menuData = await menuRes.json();
      const galleryData = await galleryRes.json();
      const voucherData = await voucherRes.json();
      const reviewsData = await reviewsRes.json();

      if (Array.isArray(menuData)) setMenuItems(menuData);
      if (Array.isArray(galleryData)) setGallery(galleryData);
      
      // [FIX] Log kiểm tra dữ liệu voucher
      console.log("Vouchers fetched:", voucherData);
      if (Array.isArray(voucherData)) setVouchers(voucherData);

      // Tính điểm đánh giá
      if (Array.isArray(reviewsData) && reviewsData.length > 0) {
          const total = reviewsData.reduce((acc: number, curr: any) => acc + curr.rating, 0);
          const avg = total / reviewsData.length;
          setAverageRating(Number(avg.toFixed(1)));
          setReviewCount(reviewsData.length);
      } else {
          setAverageRating(0);
          setReviewCount(0);
      }

      // 3. Kiểm tra voucher đã lưu (nếu đã đăng nhập)
      if (user) {
        const resSaved = await fetch(`${API_URL}/api/user-vouchers?userId=${user.uid}`);
        const savedData = await resSaved.json();
        
        if (Array.isArray(savedData)) {
          // API user-vouchers trả về cấu trúc join, cần lấy đúng ID voucher gốc
          const savedSet = new Set(savedData.map((s: any) => s.voucher_id || s.id));
          setSavedVoucherIds(savedSet);
        }
      }

    } catch (error) {
      console.error("Lỗi tải dữ liệu chi tiết:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = async () => {
      await fetchMergedData();
  };

  const handleSaveVoucher = async (voucher: any) => {
    if (!user) { toast.error("Vui lòng đăng nhập để lưu voucher!"); return; }
    if (savedVoucherIds.has(voucher.id)) return;

    // Optimistic Update
    setSavedVoucherIds(prev => new Set(prev).add(voucher.id));
    toast.success("Đã lưu voucher vào ví!");

    try {
      const res = await fetch(`${API_URL}/api/vouchers/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          voucherId: voucher.id
        })
      });

      if (!res.ok) throw new Error("Failed");

    } catch (error) {
       // Rollback
       setSavedVoucherIds(prev => {
         const newSet = new Set(prev);
         newSet.delete(voucher.id);
         return newSet;
       });
       toast.error("Không thể lưu voucher lúc này");
    }
  };

  // Chuẩn bị dữ liệu hiển thị
  const displayImage = displayData.image_url || displayData.image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24';
  const displayName = displayData.name_vi || displayData.nameVi || displayData.name || "Địa điểm chưa có tên";
  const displayAddress = displayData.address_vi || displayData.address || "Đang cập nhật địa chỉ";
  const displayPhone = displayData.phone || location.phone || 'Chưa cập nhật';
  const displayHours = displayData.open_hours_vi || '08:00 - 22:00';
  const displayDesc = displayData.description_vi || displayData.description;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 bg-white gap-0 border-none rounded-2xl overflow-hidden z-[100] flex flex-col focus:outline-none">
        
        <DialogTitle className="sr-only">
            {displayName}
        </DialogTitle>

        {loading ? (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary"/>
            </div>
        ) : (
        <>
            {/* Header Image */}
            <div className="relative h-48 bg-gray-200 flex-shrink-0">
                <img 
                  src={displayImage} 
                  className="w-full h-full object-cover" 
                  alt={displayName} 
                  onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=No+Image"; }}
                />
                
                <button 
                  onClick={onClose} 
                  className="absolute top-4 right-4 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/70 transition-colors z-10"
                >
                    <X className="w-5 h-5"/>
                </button>

                {canEdit && (
                  <Button 
                    size="sm" 
                    className="absolute bottom-4 right-4 bg-white/90 text-black hover:bg-white shadow-md border backdrop-blur-sm"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-2"/> Chỉnh sửa
                  </Button>
                )}
            </div>

            {/* Info Header */}
            <div className="pt-4 px-6 pb-2 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{displayName}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Star className={`w-4 h-4 ${averageRating > 0 ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`} />
                    
                    <span className="font-bold text-gray-900">
                        {averageRating > 0 ? averageRating : "Chưa có đánh giá"}
                    </span>
                    
                    {reviewCount > 0 && <span>({reviewCount})</span>}

                    <span className="capitalize px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                      {displayData.category || displayData.type || 'Địa điểm'}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-green-600"/> <span>{displayHours}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-blue-600"/> <span>{displayPhone}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-red-500"/> 
                    <span className="truncate">{displayAddress}</span>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0" value={activeTab} onValueChange={setActiveTab}>
                <div className="px-6 border-b flex-shrink-0 bg-white sticky top-0 z-10">
                    <TabsList className="w-full justify-start bg-transparent h-12 p-0 gap-6 overflow-x-auto no-scrollbar">
                        <TabsTrigger value="info" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-0 bg-transparent font-medium">
                            Thông tin
                        </TabsTrigger>
                        <TabsTrigger value="menu" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-0 bg-transparent font-medium">
                            Thực đơn ({menuItems.length})
                        </TabsTrigger>
                        <TabsTrigger value="vouchers" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-0 bg-transparent font-medium">
                            Voucher ({vouchers.length})
                        </TabsTrigger>
                        <TabsTrigger value="gallery" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-0 bg-transparent font-medium">
                            Ảnh ({gallery.length})
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-0 bg-transparent font-medium">
                            Đánh giá ({reviewCount})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50 p-4 scroll-smooth">
                    {/* TAB INFO */}
                    <TabsContent value="info" className="m-0 focus:outline-none">
                        <div className="bg-white p-5 rounded-xl shadow-sm border space-y-3">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Info className="w-4 h-4 text-blue-500"/> Giới thiệu
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {displayDesc || "Chưa có mô tả chi tiết về địa điểm này."}
                            </p>
                        </div>
                    </TabsContent>

                    {/* TAB MENU */}
                    <TabsContent value="menu" className="space-y-4 m-0 focus:outline-none">
                    {menuItems.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Utensils className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                            <p>Chưa cập nhật thực đơn.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {menuItems.map((item) => (
                                <div key={item.id} className="bg-white p-2 rounded-xl border flex gap-3 hover:shadow-md transition-shadow">
                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img 
                                        src={item.image_url || 'https://placehold.co/100x100'} 
                                        className="w-full h-full object-cover" 
                                        alt={item.name} 
                                        onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=Food"; }}
                                    />
                                </div>
                                <div className="flex-1 py-1 flex flex-col justify-between">
                                    <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{item.name_vi || item.name}</h4>
                                    <span className="font-bold text-primary block">
                                        {item.price ? new Intl.NumberFormat('vi-VN').format(Number(item.price)) : 0}đ
                                    </span>
                                </div>
                                </div>
                            ))}
                        </div>
                    )}
                    </TabsContent>

                    {/* TAB VOUCHERS */}
                    <TabsContent value="vouchers" className="space-y-3 m-0 focus:outline-none">
                    {vouchers.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Ticket className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                            <p>Không có mã giảm giá nào.</p>
                        </div>
                    ) : (
                        vouchers.map((v) => {
                        const isSaved = savedVoucherIds.has(v.id);
                        
                        // [FIX HIỂN THỊ] Dùng fallback để tránh lỗi nếu tên biến khác nhau
                        const title = v.title_vi || v.title || "Mã giảm giá";
                        const discount = v.discount_value || v.discount || v.discount_amount || 0;
                        const type = v.discount_type || v.type || 'amount';
                        const code = v.code || 'CODE';

                        return (
                            <div key={v.id} className="bg-white rounded-xl border border-dashed border-orange-200 p-4 shadow-sm relative group hover:border-orange-400 transition-colors">
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-orange-50 rounded-lg flex flex-col items-center justify-center border border-orange-100 text-orange-600 flex-shrink-0">
                                    <span className="text-xl font-black">
                                        {new Intl.NumberFormat('vi-VN').format(Number(discount))}
                                    </span>
                                    <span className="text-xs font-bold uppercase">
                                        {type === 'percent' ? '%' : 'k'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">{title}</h4>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        Mã: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-bold">{code}</span>
                                    </p>
                                </div>
                                <Button 
                                    onClick={() => handleSaveVoucher(v)}
                                    disabled={isSaved}
                                    size="sm"
                                    className={`shrink-0 ${isSaved ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                                >
                                    {isSaved ? <><Check className="w-4 h-4 mr-1"/> Đã lưu</> : "Lưu mã"}
                                </Button>
                            </div>
                            </div>
                        )
                        })
                    )}
                    </TabsContent>

                    {/* TAB GALLERY */}
                    <TabsContent value="gallery" className="m-0 focus:outline-none">
                    {gallery.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                            <p>Chưa có hình ảnh nào khác.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {gallery.map((img) => (
                                <div key={img.id} className="aspect-square rounded-xl overflow-hidden border bg-gray-100 cursor-pointer hover:opacity-90">
                                    <img src={img.image_url} className="w-full h-full object-cover" alt="" />
                                </div>
                            ))}
                        </div>
                    )}
                    </TabsContent>

                    {/* TAB REVIEWS */}
                    <TabsContent value="reviews" className="m-0 focus:outline-none">
                        <ReviewSection storeId={rawId} />
                    </TabsContent>
                </div>
            </Tabs>
        </>
        )}

      </DialogContent>
    </Dialog>

    {isEditOpen && (
        <StoreFormModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onSubmit={handleEditSuccess}
            initialData={displayData}
            customStoreId={rawId}
        />
    )}
    </>
  );
};