import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Heart, LogIn, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/LanguageContext';

interface UserMenuProps {
  onLoginClick: () => void;
  onFavoritesClick: () => void;
  onStoresClick?: () => void;
}

export const UserMenu = ({ onLoginClick, onFavoritesClick, onStoresClick }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, isAuthenticated } = useAuth();
  const { language } = useLanguage();

  const texts = {
    vi: {
      login: 'Đăng nhập',
      favorites: 'Yêu thích',
      stores: 'Cửa hàng của tôi',
      logout: 'Đăng xuất',
    },
    en: {
      login: 'Login',
      favorites: 'Favorites',
      stores: 'My Stores',
      logout: 'Logout',
    },
  };

  const t = texts[language];

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={onLoginClick}
        className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
      >
        <LogIn className="w-5 h-5 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground"
      >
        <User className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-12 z-50 w-56 bg-background rounded-2xl shadow-xl border overflow-hidden"
            >
              <div className="p-3 border-b bg-muted/30">
                <p className="text-sm font-medium truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    onFavoritesClick();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
                >
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="font-medium">{t.favorites}</span>
                </button>
                {onStoresClick && (
                  <button
                    onClick={() => {
                      onStoresClick();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
                  >
                    <Store className="w-5 h-5 text-primary" />
                    <span className="font-medium">{t.stores}</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-destructive"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">{t.logout}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};