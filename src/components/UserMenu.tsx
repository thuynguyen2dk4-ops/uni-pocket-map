import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, MapPin, Store, ShieldCheck, Crown, Megaphone, Loader2, X, Check } from "lucide-react"; 
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client"; // Đã sửa đường dẫn chuẩn

interface UserMenuProps {
  onLoginClick: () => void;
  onFavoritesClick: () => void;
  onStoresClick: () => void;
}

export const UserMenu = ({ onLoginClick, onFavoritesClick, onStoresClick }: UserMenuProps) => {
  const { session, signOut } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  
  // State quản lý danh sách cửa hàng và popup chọn
  const [myStores, setMyStores] = useState<any[]>([]);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [pendingService, setPendingService] = useState<{type: 'vip' | 'ad', packageType?: 'week' | 'month'} | null>(null);

  // Lấy danh sách cửa hàng của user khi component load
  useEffect(() => {
    if (session?.user) {
      const fetchStores = async () => {
        const { data } = await supabase
          .from('user_stores')
          .select('id, name_vi, address_vi, is_premium') // Lấy cả is_premium để hiện trạng thái
          .eq('user_id', session.user.id);
        if (data) setMyStores(data);
      };
      fetchStores();
    }
  }, [session]);

  // Bước 1: Khi bấm nút Mua -> Kiểm tra số lượng cửa hàng
  const handleInitiateBuy = (type: 'vip' | 'ad', packageType?: 'week' | 'month') => {
    if (!myStores || myStores.length === 0) {
        alert("Bạn chưa có cửa hàng nào! Hãy tạo cửa hàng trước.");
        return;
    }

    // Nếu chỉ có 1 cửa hàng -> Mua luôn cho nó (đỡ mất công chọn)
    if (myStores.length === 1) {
        handleBuyService(myStores[0].id, type, packageType);
    } 
    // Nếu có nhiều cửa hàng -> Mở popup cho chọn
    else {
        setPendingService({ type, packageType });
        setShowStoreSelector(true);
    }
  };

  // Bước 2: Gọi API thanh toán (đã biết chính xác storeId)
  const handleBuyService = async (storeId: string, type: 'vip' | 'ad', packageType?: 'week' | 'month') => {
    setIsLoading(true);
    setShowStoreSelector(false); // Đóng popup nếu đang mở

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          storeId: storeId,
          type: type,             
          packageType: packageType, 
          categoryId: 1,          
          returnUrl: window.location.href, 
          cancelUrl: window.location.href
        }
      });

      if (error) throw error;

      if (data && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Không lấy được link thanh toán");
      }

    } catch (err: any) {
      console.error(err);
      alert("Lỗi: " + (err.message || "Có lỗi xảy ra"));
    } finally {
        setIsLoading(false);
    }
  };

  // --- RENDERING ---

  if (!session) {
    return (
      <Button 
        onClick={onLoginClick}
        variant="default" 
        className="gap-2 shadow-lg rounded-xl font-semibold bg-white text-black hover:bg-gray-100"
      >
        <User className="w-4 h-4" />
        {language === 'vi' ? 'Đăng nhập' : 'Login'}
      </Button>
    );
  }

  const email = session.user.email;
  const firstLetter = email ? email[0].toUpperCase() : 'U';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="relative w-10 h-10 rounded-full p-0 overflow-hidden shadow-lg border-2 border-white cursor-pointer">
            <Avatar className="h-full w-full">
              <AvatarImage src={session.user.user_metadata.avatar_url} />
              <AvatarFallback className="bg-green-600 text-white font-bold">
                {firstLetter}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64 rounded-xl p-2 mt-2 bg-white shadow-xl border border-gray-100">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {language === 'vi' ? 'Tài khoản' : 'Account'}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate font-normal text-gray-500">
                {email}
              </p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="my-1 bg-gray-100" />

          {/* --- MENU MUA DỊCH VỤ --- */}
          <div className="bg-gray-50 rounded-lg p-2 mb-2 border border-gray-100">
            <p className="text-[10px] uppercase text-gray-500 font-bold mb-2 pl-1">
              {language === 'vi' ? 'Nâng cấp cửa hàng' : 'Upgrade Store'}
            </p>
            
            {/* Nút VIP */}
            <button
              disabled={isLoading}
              // Gọi hàm kiểm tra số lượng cửa hàng trước
              onClick={() => handleInitiateBuy('vip')}
              className="w-full flex items-center gap-2 text-xs font-semibold text-yellow-700 bg-yellow-100 hover:bg-yellow-200 p-2 rounded mb-2 transition-colors"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Crown className="w-3 h-3 fill-yellow-600" />}
              VIP (5.000đ/tháng)
            </button>

            {/* Nút Quảng Cáo */}
            <div className="grid grid-cols-2 gap-1">
              <button
                disabled={isLoading}
                onClick={() => handleInitiateBuy('ad', 'week')}
                className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded transition-colors"
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Megaphone className="w-3 h-3" />}
                QC Tuần
              </button>
              <button
                disabled={isLoading}
                onClick={() => handleInitiateBuy('ad', 'month')}
                className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded transition-colors"
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Megaphone className="w-3 h-3" />}
                QC Tháng
              </button>
            </div>
          </div>
          {/* ----------------------------- */}

          {email === 'admin@gmail.com' && (
            <>
              <DropdownMenuItem 
                onClick={() => navigate('/admin')} 
                className="cursor-pointer font-bold text-blue-600 bg-blue-50 focus:bg-blue-100 rounded-lg p-2 mb-1"
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-gray-100" />
            </>
          )}
          
          <DropdownMenuItem onClick={onFavoritesClick} className="cursor-pointer rounded-lg hover:bg-gray-50 p-2">
            <MapPin className="mr-2 h-4 w-4 text-green-600" />
            <span>{language === 'vi' ? 'Địa điểm yêu thích' : 'Favorite Locations'}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onStoresClick} className="cursor-pointer rounded-lg hover:bg-gray-50 p-2">
            <Store className="mr-2 h-4 w-4 text-orange-500" />
            <span>{language === 'vi' ? 'Cửa hàng của tôi' : 'My Stores'}</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="my-1 bg-gray-100" />
          
          <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg p-2">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{language === 'vi' ? 'Đăng xuất' : 'Log out'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- POPUP CHỌN CỬA HÀNG (HIỆN KHI CÓ > 1 STORE) --- */}
      {showStoreSelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Chọn cửa hàng để nâng cấp</h3>
                    <button onClick={() => setShowStoreSelector(false)} className="p-1 hover:bg-gray-200 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                
                <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                    {myStores.map(store => (
                        <button
                            key={store.id}
                            onClick={() => pendingService && handleBuyService(store.id, pendingService.type, pendingService.packageType)}
                            className="w-full text-left p-3 rounded-xl border hover:border-blue-500 hover:bg-blue-50 transition-all group relative"
                        >
                            <div className="font-bold text-gray-900 group-hover:text-blue-700">{store.name_vi}</div>
                            <div className="text-xs text-gray-500 truncate">{store.address_vi}</div>
                            
                            {/* Nếu store đã VIP thì hiện thông báo */}
                            {store.is_premium && pendingService?.type === 'vip' && (
                                <span className="absolute top-3 right-3 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                                    Đã VIP
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}
    </>
  );
};