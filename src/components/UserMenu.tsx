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
import { User, LogOut, MapPin, Store, ShieldCheck } from "lucide-react"; // Đã thêm icon ShieldCheck cho Admin
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { useNavigate } from "react-router-dom"; // <--- 1. Import cái này

interface UserMenuProps {
  onLoginClick: () => void;
  onFavoritesClick: () => void;
  onStoresClick: () => void;
}

export const UserMenu = ({ onLoginClick, onFavoritesClick, onStoresClick }: UserMenuProps) => {
  const { session, signOut } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate(); // <--- 2. Khai báo hook chuyển trang

  // Nếu chưa đăng nhập
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

  // Nếu đã đăng nhập
  const email = session.user.email;
  const firstLetter = email ? email[0].toUpperCase() : 'U';

  return (
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
      
      <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 mt-2 bg-white shadow-xl border border-gray-100">
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

        {/* --- 3. ĐOẠN CODE BẠN CẦN THÊM NẰM Ở ĐÂY --- */}
        {email === 'admin@gmail.com' && (
          <>
            <DropdownMenuItem 
              onClick={() => navigate('/admin')} 
              className="cursor-pointer font-bold text-blue-600 bg-blue-50 focus:bg-blue-100 rounded-lg p-2 mb-1"
            >
              <ShieldCheck className="mr-2 h-4 w-4" /> {/* Dùng icon Khiên cho khác biệt */}
              <span>Trang Quản Trị (Admin)</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-gray-100" />
          </>
        )}
        {/* ------------------------------------------- */}
        
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
  );
};