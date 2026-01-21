import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, MapPin, Navigation, Trash2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites, Favorite } from '@/hooks/useFavorites';
import { useLanguage } from '@/i18n/LanguageContext';
import { locations, Location } from '@/data/locations';

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: Location) => void;
  onNavigate: (location: Location) => void;
  onLoginClick: () => void;
}

export const FavoritesPanel = ({
  isOpen,
  onClose,
  onSelectLocation,
  onNavigate,
  onLoginClick,
}: FavoritesPanelProps) => {
  const { favorites, loading, removeFavorite, isAuthenticated } = useFavorites();
  const { language } = useLanguage();

  const texts = {
    vi: {
      title: 'Địa điểm yêu thích',
      empty: 'Chưa có địa điểm yêu thích',
      emptyDesc: 'Nhấn vào biểu tượng ❤️ để lưu địa điểm',
      loginRequired: 'Đăng nhập để lưu',
      loginDesc: 'Đăng nhập để lưu địa điểm yêu thích và truy cập trên mọi thiết bị',
      login: 'Đăng nhập',
      navigate: 'Chỉ đường',
    },
    en: {
      title: 'Favorite Locations',
      empty: 'No favorite locations yet',
      emptyDesc: 'Tap the ❤️ icon to save a location',
      loginRequired: 'Login to save',
      loginDesc: 'Login to save favorite locations and access them on all devices',
      login: 'Login',
      navigate: 'Navigate',
    },
  };

  const t = texts[language];

  const getLocationFromFavorite = (fav: Favorite): Location | undefined => {
    return locations.find((loc) => loc.id === fav.location_id);
  };

  const handleLocationClick = (fav: Favorite) => {
    const location = getLocationFromFavorite(fav);
    if (location) {
      onSelectLocation(location);
      onClose();
    }
  };

  const handleNavigateClick = (e: React.MouseEvent, fav: Favorite) => {
    e.stopPropagation();
    const location = getLocationFromFavorite(fav);
    if (location) {
      onNavigate(location);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </div>
              <h2 className="text-lg font-bold">{t.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
            {!isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <LogIn className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t.loginRequired}</h3>
                <p className="text-muted-foreground text-sm mb-6 px-4">{t.loginDesc}</p>
                <Button onClick={onLoginClick} className="rounded-2xl px-8">
                  {t.login}
                </Button>
              </motion.div>
            ) : favorites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Heart className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t.empty}</h3>
                <p className="text-muted-foreground text-sm">{t.emptyDesc}</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {favorites.map((fav, index) => (
                  <motion.div
                    key={fav.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleLocationClick(fav)}
                    className="flex items-center gap-3 p-4 bg-muted/50 rounded-2xl cursor-pointer hover:bg-muted transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {language === 'en' && fav.location_name_en
                          ? fav.location_name_en
                          : fav.location_name}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {fav.location_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleNavigateClick(e, fav)}
                        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Navigation className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(fav.location_id);
                        }}
                        className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
