import { useState, useEffect } from 'react';
// 1. Import DialogTitle
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, MapPin, Star, Ticket, Clock, Utensils, Image as ImageIcon, Check, Phone, Loader2, MessageSquare, Edit3, Info } from 'lucide-react';
import { Location } from '@/data/locations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ReviewSection } from './ReviewSection';
import { StoreFormModal } from './StoreFormModal';

interface StoreDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
  onNavigate?: () => void;
}

export const StoreDetailModal = ({ isOpen, onClose, location, onNavigate }: StoreDetailModalProps) => {
  // 1. Kiểm tra an toàn: Nếu không có location thì không render gì cả
  if (!location) return null;

  const { session } = useAuth();
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

  // Xử lý ID an toàn
  const rawId = String(location.id).replace('user-store-', '');

  // Logic phân quyền
  const isAdmin = session?.user?.email === "admin@example.com"; // Thay bằng logic check role thực tế của bạn
  const isOwner = displayData?.user_id === session?.user?.id;
  const canEdit = isAdmin || isOwner;

  useEffect(() => {
    if (isOpen && location) {
      fetchMergedData();
    }
  }, [isOpen, location.id]);

  const fetchMergedData = async () => {
    setLoading(true);
    
    // 1. Lấy thông tin chi tiết từ bảng user_stores
    const { data: dbStore } = await (supabase as any)
      .from('user_stores')
      .select('*')
      .eq('id', rawId)
      .maybeSingle();

    // Ưu tiên dữ liệu từ DB, nếu không có thì dùng dữ liệu local/mapbox
    const finalData = dbStore ? dbStore : location;
    setDisplayData(finalData);

    // 2. Fetch các dữ liệu liên quan song song để nhanh hơn
    const [menuRes, galleryRes, voucherRes, reviewsRes] = await Promise.all([
        (supabase as any).from('store_menu_items').select('*').eq('store_id', rawId),
        (supabase as any).from('store_gallery').select('*').eq('store_id', rawId),
        (supabase as any).from('store_vouchers').select('*').eq('store_id', rawId).eq('is_active', true),
        (supabase as any).from('location_reviews').select('rating').eq('store_id', rawId)
    ]);

    if (menuRes.data) setMenuItems(menuRes.data);
    if (galleryRes.data) setGallery(galleryRes.data);
    if (voucherRes.data) setVouchers(voucherRes.data);

    // Tính điểm đánh giá
    if (reviewsRes.data && reviewsRes.data.length > 0) {
        const total = reviewsRes.data.reduce((acc: number, curr: any) => acc + curr.rating, 0);
        const avg = total / reviewsRes.data.length;
        setAverageRating(Number(avg.toFixed(1)));
        setReviewCount(reviewsRes.data.length);
    } else {
        setAverageRating(0);
        setReviewCount(0);
    }

    // Kiểm tra voucher đã lưu (nếu đã đăng nhập)
    if (session?.user && voucherRes.data && voucherRes.data.length > 0) {
      const ids = voucherRes.data.map((v:any) => v.id);
      const { data: saved } = await (supabase as any)
        .from('user_saved_vouchers')
        .select('voucher_id')
        .eq('user_id', session.user.id)
        .in('voucher_id', ids);
      
      if (saved) setSavedVoucherIds(new Set(saved.map((s:any) => s.voucher_id)));
    }

    setLoading(false);
  };

  const handleEditSuccess = async () => {
      await fetchMergedData();
  };

  const handleSaveVoucher = async (voucher: any) => {
    if (!session?.user) { toast.error("Vui lòng đăng nhập để lưu voucher!"); return; }
    if (savedVoucherIds.has(voucher.id)) return;

    const { error } = await (supabase as any).from('user_saved_vouchers').insert({
      user_id: session.user.id,
      voucher_id: voucher.id
    });

    if (!error || error.code === '23505') { // 23505 là mã lỗi trùng lặp (đã lưu rồi)
      toast.success("Đã lưu voucher vào ví!");
      setSavedVoucherIds(prev => new Set(prev).add(voucher.id));
    } else {
        toast.error("Không thể lưu voucher lúc này");
    }
  };

  // Chuẩn bị dữ liệu hiển thị (Fallback an toàn)
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
        
        {/* 2. THÊM DIALOG TITLE (Ẩn đi để không phá vỡ UI nhưng vẫn đảm bảo Accessibility) */}
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
                
                {/* Nút đóng */}
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
                                    <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{item.name}</h4>
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
                        return (
                            <div key={v.id} className="bg-white rounded-xl border border-dashed border-orange-200 p-4 shadow-sm relative group hover:border-orange-400 transition-colors">
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-orange-50 rounded-lg flex flex-col items-center justify-center border border-orange-100 text-orange-600 flex-shrink-0">
                                    <span className="text-xl font-black">{v.discount_value}</span>
                                    <span className="text-xs font-bold uppercase">{v.discount_type === 'percent' ? '%' : 'k'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">{v.title_vi}</h4>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        Mã: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-bold">{v.code}</span>
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