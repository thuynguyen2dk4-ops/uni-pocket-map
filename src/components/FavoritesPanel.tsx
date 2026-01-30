import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Location } from '@/data/locations';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Heart, Ticket, Trash2, ExternalLink, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU (Giúp code tường minh hơn) ---
interface SavedVoucherItem {
  id: string; // ID của bảng user_saved_vouchers
  voucher: {
    id: string;
    code: string;
    title_vi: string;
    discount_value: number;
    discount_type: 'percent' | 'amount';
    store: {
      id: string;
      name_vi: string;
      lat: number;
      lng: number;
      address_vi: string;
      image_url: string | null;
    }
  }
}

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: Location, department?: any) => void;
  onNavigate: (location: Location) => void;
  onLoginClick: () => void;
}

export const FavoritesPanel = ({ 
  isOpen, 
  onClose, 
  onSelectLocation, 
  onNavigate, 
  onLoginClick 
}: FavoritesPanelProps) => {
  
  const { session } = useAuth();
  const [favorites, setFavorites] = useState<Location[]>([]);
  const [savedVouchers, setSavedVouchers] = useState<SavedVoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Không cần state activeTab trừ khi bạn muốn điều khiển nó từ bên ngoài

  const fetchData = async () => {
    if (!session?.user) return;
    setLoading(true);

    try {
      // 1. Tải địa điểm yêu thích (Favorites)
      const { data: favData, error: favError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', session.user.id);

      if (favError) throw favError;
      
      if (favData) {
        const mappedFavs: Location[] = favData.map((f: any) => ({
          id: f.location_id,
          name: f.location_name_en || f.location_name, // Fallback tên
          nameVi: f.location_name,
          lat: f.location_lat,
          lng: f.location_lng,
          type: f.location_type || 'checkin',
          address: 'Địa điểm đã lưu', // Có thể cập nhật thêm cột address trong bảng favorites nếu cần
          description: '', 
          image: '',
        }));
        setFavorites(mappedFavs);
      }

      // 2. Tải Voucher đã lưu (Nested Query)
      const { data: voucherData, error: voucherError } = await supabase
        .from('user_saved_vouchers' as any) // Ép kiểu tạm nếu chưa generate types
        .select(`
          id,
          voucher:store_vouchers (
            id, code, title_vi, discount_value, discount_type,
            store:user_stores (
              id, name_vi, lat, lng, address_vi, image_url
            )
          )
        `)
        .eq('user_id', session.user.id);

      if (voucherError) throw voucherError;

      if (voucherData) {
        // Lọc bỏ những voucher mà store bị null (đề phòng store bị xóa)
        const validVouchers = voucherData.filter((v: any) => v.voucher && v.voucher.store);
        setSavedVouchers(validVouchers);
      }

    } catch (error) {
      console.error("🔥 Lỗi tải dữ liệu:", error);
      toast.error("Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [session, isOpen]);

  const removeFavorite = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    // Optimistic UI Update (Xóa trên giao diện trước)
    setFavorites(prev => prev.filter(f => f.id !== id));
    
    const { error } = await supabase.from('favorites').delete().eq('location_id', id);
    if (error) {
       toast.error("Lỗi khi xóa, vui lòng thử lại");
       fetchData(); // Rollback nếu lỗi
    } else {
       toast.success("Đã xóa khỏi yêu thích");
    }
  };

  const removeVoucher = async (e: React.MouseEvent, savedId: string) => {
    e.stopPropagation(); // QUAN TRỌNG: Chặn sự kiện click xuyên qua
    
    const prevVouchers = [...savedVouchers];
    setSavedVouchers(prev => prev.filter(v => v.id !== savedId));

    const { error } = await supabase
      .from('user_saved_vouchers' as any)
      .delete()
      .eq('id', savedId);

    if (error) {
      setSavedVouchers(prevVouchers); // Rollback
      toast.error("Không xóa được voucher");
    } else {
      toast.success("Đã xóa voucher");
    }
  };

  // Hàm điều hướng chung
  const handleLocationClick = (location: Location) => {
    if (onNavigate) {
      onNavigate(location);
    } else if (onSelectLocation) {
      onSelectLocation(location);
    }
    onClose(); // Đóng panel sau khi chọn
  };

  const handleUseVoucher = (item: SavedVoucherItem) => {
    const store = item.voucher.store;
    // Tạo object Location giả lập từ dữ liệu Store để Map có thể đọc được
    const locationData: Location = {
      id: store.id, // ID dạng UUID của store
      nameVi: store.name_vi,
      name: store.name_vi,
      lat: store.lat,
      lng: store.lng,
      type: 'food', // Hoặc lấy type từ store nếu có
      address: store.address_vi,
      description: `Ưu đãi: Giảm ${item.voucher.discount_value}${item.voucher.discount_type === 'percent' ? '%' : 'k'} - Code: ${item.voucher.code}`,
      image: store.image_url || 'https://placehold.co/600x400?text=Store',
    };
    
    handleLocationClick(locationData);
    toast.info(`Đang dẫn đường đến: ${store.name_vi}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-[60] w-full md:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-r">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" /> 
          Kho lưu trữ
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-200">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-white">
        {!session ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
               <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Chưa đăng nhập</h3>
              <p className="text-sm text-gray-500 mt-1">Đăng nhập để đồng bộ địa điểm và voucher của bạn.</p>
            </div>
            <Button onClick={onLoginClick} className="rounded-xl font-bold">Đăng nhập ngay</Button>
          </div>
        ) : (
          <Tabs defaultValue="locations" className="w-full h-full flex flex-col">
            
            <div className="px-4 pt-4 pb-2">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 p-1 rounded-xl">
                <TabsTrigger value="locations" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                   Địa điểm
                </TabsTrigger>
                <TabsTrigger value="vouchers" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                   Voucher <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{savedVouchers.length}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: ĐỊA ĐIỂM */}
            <TabsContent value="locations" className="flex-1 overflow-y-auto px-4 pb-4 pt-2 space-y-3">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                   <MapPin className="w-10 h-10 text-gray-200 mx-auto" />
                   <p className="text-gray-400 text-sm">Bạn chưa lưu địa điểm nào.</p>
                </div>
              ) : (
                favorites.map((loc) => (
                  <div 
                    key={loc.id} 
                    className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-primary/50 hover:shadow-md cursor-pointer transition-all group" 
                    onClick={() => handleLocationClick(loc)}
                  >
                    <div className="bg-red-50 p-2.5 rounded-full text-red-500 flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate text-gray-900">{loc.nameVi}</h4>
                      <p className="text-xs text-gray-500 truncate">{loc.address || "Địa điểm trên bản đồ"}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full" 
                      onClick={(e) => removeFavorite(e, loc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>

            {/* TAB 2: VOUCHER */}
            <TabsContent value="vouchers" className="flex-1 overflow-y-auto px-4 pb-4 pt-2 space-y-3">
               {loading ? (
                 <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
               ) : savedVouchers.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <Ticket className="w-10 h-10 text-gray-200 mx-auto" />
                    <p className="text-gray-400 text-sm">Ví voucher trống.</p>
                  </div>
                ) : (
                savedVouchers.map((item) => (
                  <div 
                    key={item.id} 
                    className="relative bg-white border border-dashed border-primary/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary transition-all group cursor-pointer"
                    onClick={() => handleUseVoucher(item)} 
                  >
                    <div className="flex items-stretch h-24">
                      {/* Cột trái: Giá trị */}
                      <div className="bg-primary/5 w-24 flex flex-col items-center justify-center p-2 border-r border-dashed border-primary/30 shrink-0">
                        <span className="text-2xl font-black text-primary leading-none">
                          {item.voucher.discount_value}<span className="text-sm font-bold">{item.voucher.discount_type === 'percent' ? '%' : 'k'}</span>
                        </span>
                        <span className="text-[10px] text-primary/70 font-bold uppercase mt-1 text-center">Giảm giá</span>
                      </div>
                      
                      {/* Cột phải: Thông tin */}
                      <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
                        <div>
                           <h4 className="font-bold text-sm truncate text-gray-900" title={item.voucher.store.name_vi}>
                             {item.voucher.store.name_vi}
                           </h4>
                           <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{item.voucher.title_vi}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <code className="bg-gray-50 border px-1.5 py-0.5 rounded text-[11px] font-mono font-bold text-gray-600">
                            {item.voucher.code}
                          </code>
                          <span className="text-xs text-primary font-bold flex items-center group-hover:underline">
                            Dùng ngay <ExternalLink className="w-3 h-3 ml-1" />
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Nút xóa - Đã tối ưu cho Mobile (Luôn hiện mờ, đậm khi hover) */}
                    <button 
                      onClick={(e) => removeVoucher(e, item.id)} 
                      className="absolute top-1 right-1 p-1.5 text-gray-400/50 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-10"
                      title="Xóa voucher"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </TabsContent>

          </Tabs>
        )}
      </div>
    </div>
  );
};