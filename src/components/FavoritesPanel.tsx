import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Location } from '@/data/locations';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Heart, Ticket, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

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
  const [favorites, setFavorites] = useState<any[]>([]);
  const [savedVouchers, setSavedVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("locations");

  const fetchData = async () => {
    if (!session?.user) return;
    setLoading(true);

    try {
      // 1. Tải địa điểm yêu thích
      const { data: favData } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (favData) {
        const mappedFavs = favData.map((f: any) => ({
          id: f.location_id,
          name: f.location_name_en || f.location_name,
          nameVi: f.location_name,
          lat: f.location_lat,
          lng: f.location_lng,
          type: f.location_type,
          address: 'Đã lưu',
          description: '', 
          image: '',
        }));
        setFavorites(mappedFavs);
      }

      // 2. Tải Voucher đã lưu
      const { data: voucherData } = await supabase
        .from('user_saved_vouchers' as any)
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
console.log("🔥 Dữ liệu Voucher tải về:", voucherData);
      console.log("🔥 Lỗi nếu có:", Error);
      if (voucherData) {
        setSavedVouchers(voucherData);
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [session, isOpen]);

  const removeFavorite = async (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
    await supabase.from('favorites').delete().eq('location_id', id);
    toast.success("Đã xóa khỏi yêu thích");
  };

  const removeVoucher = async (e: React.MouseEvent, savedId: string) => {
    e.stopPropagation(); // QUAN TRỌNG: Chặn sự kiện click xuyên qua (để không bị mở cửa hàng khi đang xóa)
    const { error } = await supabase
      .from('user_saved_vouchers' as any)
      .delete()
      .eq('id', savedId);

    if (!error) {
      toast.success("Đã xóa voucher");
      setSavedVouchers(prev => prev.filter(v => v.id !== savedId));
    }
  };

  // Hàm điều hướng chung
  const handleLocationClick = (location: Location) => {
    if (onNavigate) {
      onNavigate(location);
    } else if (onSelectLocation) {
      onSelectLocation(location);
    }
    onClose();
  };

  const handleUseVoucher = (v: any) => {
    // Tạo object Location giả để map bay tới đó
    const locationData: Location = {
      id: v.voucher.store.id,
      nameVi: v.voucher.store.name_vi,
      name: v.voucher.store.name_vi,
      lat: v.voucher.store.lat,
      lng: v.voucher.store.lng,
      type: 'food',
      address: v.voucher.store.address_vi,
      description: `Mã giảm giá: ${v.voucher.code} - ${v.voucher.title_vi}`,
      image: v.voucher.store.image_url || 'https://placehold.co/600x400?text=Store',
    };
    
    handleLocationClick(locationData);
    toast.success(`Đang di chuyển đến: ${locationData.nameVi}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full md:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-r">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" /> Đã lưu
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4 bg-white">
        {!session ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <Heart className="w-12 h-12 text-gray-200" />
            <p className="text-gray-500">Vui lòng đăng nhập để xem danh sách đã lưu.</p>
            <Button onClick={onLoginClick}>Đăng nhập ngay</Button>
          </div>
        ) : (
          <Tabs defaultValue="locations" className="w-full h-full flex flex-col" onValueChange={setActiveTab}>
            
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 p-1">
              <TabsTrigger value="locations" className="flex items-center gap-2">
                <Heart className="w-4 h-4" /> Địa điểm
              </TabsTrigger>
              <TabsTrigger value="vouchers" className="flex items-center gap-2">
                <Ticket className="w-4 h-4" /> Voucher ({savedVouchers.length})
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: ĐỊA ĐIỂM */}
            <TabsContent value="locations" className="flex-1 overflow-y-auto pr-2 space-y-3">
              {loading ? <div className="text-center py-4 text-gray-400">Đang tải...</div> : 
               favorites.length === 0 ? <p className="text-center text-gray-400 py-10">Chưa lưu địa điểm nào.</p> : (
                favorites.map((loc) => (
                  <div 
                    key={loc.id} 
                    className="flex items-center gap-3 p-3 bg-white border rounded-xl hover:shadow-md hover:border-primary cursor-pointer transition-all group" 
                    onClick={() => handleLocationClick(loc)}
                  >
                    <div className="bg-red-50 p-2.5 rounded-full text-red-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate text-gray-900">{loc.nameVi}</h4>
                      <p className="text-xs text-gray-500 truncate">{loc.address}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); removeFavorite(loc.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>

            {/* TAB 2: VOUCHER */}
            <TabsContent value="vouchers" className="flex-1 overflow-y-auto pr-2 space-y-3">
               {loading ? <div className="text-center py-4 text-gray-400">Đang tải...</div> : 
                savedVouchers.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <Ticket className="w-12 h-12 text-gray-200 mx-auto" />
                    <p className="text-gray-400">Ví voucher trống.</p>
                  </div>
                ) : (
                savedVouchers.map((item) => (
                  <div 
                    key={item.id} 
                    // --- ĐÂY LÀ CHỖ SỬA QUAN TRỌNG ---
                    className="relative bg-white border border-dashed border-primary/40 rounded-xl overflow-hidden hover:shadow-lg transition-all group cursor-pointer hover:bg-primary/5"
                    onClick={() => handleUseVoucher(item)} // Ấn vào thẻ -> Mở quán
                    // ---------------------------------
                  >
                    <div className="flex items-stretch">
                      {/* Cột trái: Giá trị voucher */}
                      <div className="bg-primary/10 w-24 flex flex-col items-center justify-center p-2 border-r border-dashed border-primary/40">
                        <span className="text-2xl font-black text-primary leading-none">
                          {item.voucher.discount_value}<span className="text-sm font-bold">{item.voucher.discount_type === 'percent' ? '%' : 'k'}</span>
                        </span>
                        <span className="text-[10px] text-primary/70 font-bold uppercase mt-1">Giảm giá</span>
                      </div>
                      
                      {/* Cột phải: Thông tin quán */}
                      <div className="flex-1 p-3 min-w-0 flex flex-col justify-center">
                        <h4 className="font-bold text-sm truncate text-gray-900 mb-1">{item.voucher.store.name_vi}</h4>
                        <div className="flex items-center justify-between">
                          <code className="bg-white border px-2 py-0.5 rounded text-xs font-mono font-bold text-gray-600 shadow-sm">
                            {item.voucher.code}
                          </code>
                          <span className="text-xs text-primary font-medium flex items-center group-hover:translate-x-1 transition-transform">
                            Dùng ngay <ExternalLink className="w-3 h-3 ml-1" />
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Nút xóa (chặn click xuyên qua) */}
                    <button 
                      onClick={(e) => removeVoucher(e, item.id)} 
                      className="absolute top-1 right-1 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Xóa voucher"
                    >
                      <Trash2 className="w-3 h-3" />
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