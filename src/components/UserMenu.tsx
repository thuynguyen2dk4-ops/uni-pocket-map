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
import { User, LogOut, Store, ShieldCheck, Crown, Megaphone, Loader2, X, UserCircle2, Heart } from "lucide-react"; 
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";

// 👇 Lấy link Backend
const API_URL = import.meta.env.VITE_API_URL;

interface UserMenuProps {
  onLoginClick: () => void;
  onFavoritesClick: () => void;
  onStoresClick: () => void;
}

export const UserMenu = ({ onLoginClick, onFavoritesClick, onStoresClick }: UserMenuProps) => {
  const { user, signOut } = useAuth(); // ✅ Đổi session -> user
  const { language } = useLanguage();
  const navigate = useNavigate();
   
  const [isLoading, setIsLoading] = useState(false);
  const [myStores, setMyStores] = useState<any[]>([]);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [pendingService, setPendingService] = useState<{type: 'vip' | 'ad', packageType?: 'week' | 'month'} | null>(null);

  // 1. Lấy danh sách cửa hàng của user (Gọi API Backend)
  useEffect(() => {
    if (user) {
      const fetchStores = async () => {
        try {
          const res = await fetch(`${API_URL}/api/user-stores?userId=${user.uid}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            setMyStores(data);
          }
        } catch (error) {
          console.error("Lỗi lấy danh sách cửa hàng:", error);
        }
      };
      fetchStores();
    }
  }, [user]);

  // Bước 1: Khi bấm nút Mua -> Kiểm tra
  const handleInitiateBuy = (type: 'vip' | 'ad', packageType?: 'week' | 'month') => {
    if (!myStores || myStores.length === 0) {
        alert("Bạn chưa có cửa hàng nào! Hãy tạo cửa hàng trước.");
        return;
    }

    if (myStores.length === 1) {
        handleBuyService(myStores[0].id, type, packageType);
    } else {
        setPendingService({ type, packageType });
        setShowStoreSelector(true);
    }
  };

  const handleBuyService = async (storeId: string, type: 'vip' | 'ad', packageType?: 'week' | 'month') => {
    setIsLoading(true);
    setShowStoreSelector(false);

    try {
      // 👇 Gọi API Backend tạo link thanh toán
      const response = await fetch(`${API_URL}/api/payment/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: storeId,
          userId: user?.uid,
          type: type,              
          packageType: packageType, 
          returnUrl: window.location.href, 
          cancelUrl: window.location.href
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Lỗi tạo thanh toán");

      if (data && data.checkoutUrl) {
        // Chuyển hướng sang trang thanh toán (PayOS / Stripe / MoMo...)
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

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.warn("Lỗi đăng xuất:", error);
    } finally {
      localStorage.clear(); 
      window.location.reload(); 
    }
  };

  // --- RENDERING ---

  if (!user) {
    return (
      <>
        <Button 
          variant="outline" size="icon" onClick={onLoginClick}
          className="md:hidden w-10 h-10 rounded-full border-gray-200 bg-white shadow-sm active:scale-95 transition-all text-gray-700 hover:text-green-600 hover:border-green-600"
        >
          <UserCircle2 className="w-6 h-6" />
        </Button>

        <Button 
          onClick={onLoginClick} variant="default" 
          className="hidden md:flex gap-2 shadow-lg rounded-xl font-semibold bg-white text-black hover:bg-gray-100 border border-gray-200"
        >
          <User className="w-4 h-4" />
          {language === 'vi' ? 'Đăng nhập' : 'Login'}
        </Button>
      </>
    );
  }

  const email = user.email;
  const firstLetter = email ? email[0].toUpperCase() : 'U';
  // ✅ Firebase dùng photoURL thay vì user_metadata
  const avatarUrl = user.photoURL; 

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="relative w-10 h-10 rounded-full p-0 overflow-hidden shadow-lg border-2 border-white cursor-pointer hover:ring-2 hover:ring-green-500 transition-all">
            <Avatar className="h-full w-full">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-green-600 text-white font-bold">
                {firstLetter}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64 rounded-xl p-2 mt-2 bg-white shadow-xl border border-gray-100 z-[200]">
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

          {/* MENU NÂNG CẤP */}
          <div className="bg-gray-50 rounded-lg p-2 mb-2 border border-gray-100">
            <p className="text-[10px] uppercase text-gray-500 font-bold mb-2 pl-1">
              {language === 'vi' ? 'Nâng cấp cửa hàng' : 'Upgrade Store'}
            </p>
            
            <button
              disabled={isLoading}
              onClick={() => handleInitiateBuy('vip')}
              className="w-full flex items-center gap-2 text-xs font-semibold text-yellow-700 bg-yellow-100 hover:bg-yellow-200 p-2 rounded mb-2 transition-colors"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Crown className="w-3 h-3 fill-yellow-600" />}
              VIP 
            </button>

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

          {/* MENU ADMIN */}
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
            <Heart className="mr-2 h-4 w-4 text-red-500" />
            <span>{language === 'vi' ? 'Địa điểm yêu thích' : 'Favorite Locations'}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onStoresClick} className="cursor-pointer rounded-lg hover:bg-gray-50 p-2">
            <Store className="mr-2 h-4 w-4 text-orange-500" />
            <span>{language === 'vi' ? 'Cửa hàng của tôi' : 'My Stores'}</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="my-1 bg-gray-100" />
          
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg p-2">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{language === 'vi' ? 'Đăng xuất' : 'Log out'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* POPUP CHỌN CỬA HÀNG */}
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