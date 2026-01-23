import { useState, useEffect } from 'react';
// 1. Thêm DialogTitle vào import
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

export const StoreDetailModal = ({ isOpen, onClose, location, onNavigate}: StoreDetailModalProps) => {
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

  const rawId = String(location.id).replace('user-store-', '');

  const isAdmin = session?.user?.email === "admin@example.com"; 
  const isOwner = displayData?.user_id === session?.user?.id;
  const canEdit = isAdmin || isOwner;

  useEffect(() => {
    if (isOpen) {
      fetchMergedData();
    }
  }, [isOpen, location.id]);

  const fetchMergedData = async () => {
    setLoading(true);
    
    const { data: dbStore } = await (supabase as any)
      .from('user_stores')
      .select('*')
      .eq('id', rawId)
      .maybeSingle();

    const finalData = dbStore ? dbStore : location;
    setDisplayData(finalData);

    const { data: menuData } = await (supabase as any).from('store_menu_items').select('*').eq('store_id', rawId);
    if (menuData) setMenuItems(menuData);

    const { data: galleryData } = await (supabase as any).from('store_gallery').select('*').eq('store_id', rawId);
    if (galleryData) setGallery(galleryData);

    const { data: voucherData } = await (supabase as any).from('store_vouchers').select('*').eq('store_id', rawId).eq('is_active', true);
    if (voucherData) setVouchers(voucherData);

    const { data: reviews } = await (supabase as any)
        .from('location_reviews')
        .select('rating')
        .eq('store_id', rawId);
    
    if (reviews && reviews.length > 0) {
        const total = reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0);
        const avg = total / reviews.length;
        setAverageRating(Number(avg.toFixed(1)));
        setReviewCount(reviews.length);
    } else {
        setAverageRating(0);
        setReviewCount(0);
    }

    if (session?.user && voucherData && voucherData.length > 0) {
      const ids = voucherData.map((v:any) => v.id);
      const { data: saved } = await (supabase as any).from('user_saved_vouchers').select('voucher_id').eq('user_id', session.user.id).in('voucher_id', ids);
      if (saved) setSavedVoucherIds(new Set(saved.map((s:any) => s.voucher_id)));
    }

    setLoading(false);
  };

  const handleEditSuccess = async () => {
      await fetchMergedData();
  };

  const handleSaveVoucher = async (voucher: any) => {
    if (!session?.user) { toast.error("Đăng nhập để lưu nhé!"); return; }
    if (savedVoucherIds.has(voucher.id)) return;

    const { error } = await (supabase as any).from('user_saved_vouchers').insert({
      user_id: session.user.id,
      voucher_id: voucher.id
    });

    if (!error || error.code === '23505') {
      toast.success("Đã lưu vào ví!");
      setSavedVoucherIds(prev => new Set(prev).add(voucher.id));
    } else {
        toast.error("Lỗi lưu voucher");
    }
  };

  const displayImage = displayData.image_url || displayData.image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24';
  const displayName = displayData.name_vi || displayData.nameVi || displayData.name;
  const displayAddress = displayData.address_vi || displayData.address;
  const displayPhone = displayData.phone || location.phone || 'Chưa cập nhật';
  const displayHours = displayData.open_hours_vi || '08:00 - 22:00';
  const displayDesc = displayData.description_vi || displayData.description;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 bg-white gap-0 border-none rounded-2xl overflow-hidden z-[100] flex flex-col">
        
        {/* 2. THÊM DIALOG TITLE (ẨN ĐI BẰNG CLASS sr-only) */}
        {/* Điều này giúp Screen Reader đọc được tên quán, và xóa bỏ cảnh báo lỗi */}
        <DialogTitle className="sr-only">
            {displayName || "Chi tiết địa điểm"}
        </DialogTitle>

        {loading ? (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary"/>
            </div>
        ) : (
        <>
            {/* Header Image */}
            <div className="relative h-48 bg-gray-200 flex-shrink-0">
                <img src={displayImage} className="w-full h-full object-cover" alt="" />
                <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/70">
                    <X className="w-5 h-5"/>
                </button>

                {canEdit && (
                  <Button 
                    size="sm" 
                    className="absolute bottom-4 right-4 bg-white text-black hover:bg-gray-100 shadow-md border"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2"/> Chỉnh sửa
                  </Button>
                )}
            </div>

            {/* Info Header */}
            <div className="pt-4 px-6 pb-2 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Star className={`w-4 h-4 ${averageRating > 0 ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`} />
                    
                    <span className="font-bold text-black">
                        {averageRating > 0 ? averageRating : "Chưa có đánh giá"}
                    </span>
                    
                    {reviewCount > 0 && <span>({reviewCount})</span>}

                    <span className="capitalize">• {displayData.category || displayData.type || 'Địa điểm'}</span>
                </div>

                <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-green-600"/> <span>{displayHours}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-blue-600"/> <span>{displayPhone}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 truncate">
                    <MapPin className="w-4 h-4"/> {displayAddress}
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0" value={activeTab} onValueChange={setActiveTab}>
                <div className="px-6 border-b flex-shrink-0">
                    <TabsList className="w-full justify-start bg-transparent h-12 p-0 gap-4 overflow-x-auto">
                        <TabsTrigger value="info" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-2 bg-transparent">
                            <Info className="w-4 h-4 mr-2"/> Thông tin
                        </TabsTrigger>
                        <TabsTrigger value="menu" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-2 bg-transparent">
                            <Utensils className="w-4 h-4 mr-2"/> Thực đơn ({menuItems.length})
                        </TabsTrigger>
                        <TabsTrigger value="vouchers" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-2 bg-transparent">
                            <Ticket className="w-4 h-4 mr-2"/> Voucher ({vouchers.length})
                        </TabsTrigger>
                        <TabsTrigger value="gallery" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-2 bg-transparent">
                            <ImageIcon className="w-4 h-4 mr-2"/> Ảnh ({gallery.length})
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-2 bg-transparent">
                            <MessageSquare className="w-4 h-4 mr-2"/> Đánh giá ({reviewCount})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                    {/* TAB INFO */}
                    <TabsContent value="info" className="m-0">
                        <div className="bg-white p-4 rounded-xl shadow-sm border">
                            <h3 className="font-bold text-gray-800 mb-2">Giới thiệu</h3>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {displayDesc || "Chưa có mô tả chi tiết về địa điểm này."}
                            </p>
                        </div>
                    </TabsContent>

                    {/* TAB MENU */}
                    <TabsContent value="menu" className="space-y-4 m-0">
                    {menuItems.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <Utensils className="w-12 h-12 mx-auto mb-2 opacity-20"/>
                            <p>Chưa cập nhật thực đơn.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {menuItems.map((item) => (
                                <div key={item.id} className="bg-white p-2 rounded-xl border flex gap-3 hover:shadow-md">
                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={item.image_url || 'https://placehold.co/100x100'} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="flex-1 py-1">
                                    <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{item.name}</h4>
                                    <span className="font-bold text-primary block mt-2">
                                        {item.price ? Number(item.price).toLocaleString() : 0}đ
                                    </span>
                                </div>
                                </div>
                            ))}
                        </div>
                    )}
                    </TabsContent>

                    {/* TAB VOUCHERS */}
                    <TabsContent value="vouchers" className="space-y-3 m-0">
                    {vouchers.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <Ticket className="w-12 h-12 mx-auto mb-2 opacity-20"/>
                            <p>Không có mã giảm giá nào.</p>
                        </div>
                    ) : (
                        vouchers.map((v) => {
                        const isSaved = savedVoucherIds.has(v.id);
                        return (
                            <div key={v.id} className="bg-white rounded-xl border border-dashed border-orange-200 p-4 shadow-sm relative">
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-orange-50 rounded-lg flex flex-col items-center justify-center border border-orange-100 text-orange-600 flex-shrink-0">
                                    <span className="text-xl font-black">{v.discount_value}</span>
                                    <span className="text-xs font-bold uppercase">{v.discount_type === 'percent' ? '%' : 'k'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">{v.title_vi}</h4>
                                    <p className="text-xs text-gray-500 mt-1">Mã: <span className="font-mono bg-gray-100 px-1 rounded">{v.code}</span></p>
                                </div>
                                <Button 
                                    onClick={() => handleSaveVoucher(v)}
                                    disabled={isSaved}
                                    className={`shrink-0 ${isSaved ? 'bg-green-100 text-green-600' : 'bg-orange-500 text-white'}`}
                                >
                                    {isSaved ? <Check className="w-4 h-4"/> : "Lưu"}
                                </Button>
                            </div>
                            </div>
                        )
                        })
                    )}
                    </TabsContent>

                    {/* TAB GALLERY */}
                    <TabsContent value="gallery" className="m-0">
                    {gallery.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20"/>
                            <p>Chưa có hình ảnh nào khác.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {gallery.map((img) => (
                                <div key={img.id} className="aspect-square rounded-xl overflow-hidden border">
                                    <img src={img.image_url} className="w-full h-full object-cover" alt="" />
                                </div>
                            ))}
                        </div>
                    )}
                    </TabsContent>

                    {/* TAB REVIEWS */}
                    <TabsContent value="reviews" className="m-0">
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