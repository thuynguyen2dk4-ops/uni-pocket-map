import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Navigation, Star, Clock, Phone, MapPin, Sparkles, ChevronUp, Route, Heart, Megaphone, UtensilsCrossed, Tag, Copy, Check } from 'lucide-react';
import { Location, Department } from '@/data/locations';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageIndicator } from '@/components/LanguageSwitcher';
import { AnimatedText, AnimatedBlock } from '@/components/AnimatedText';
import { useFavorites } from '@/hooks/useFavorites';
import { useStoreDetails } from '@/hooks/useStoreDetails';
import { toast } from 'sonner';

interface BottomSheetProps {
  location: Location | null;
  department?: Department | null;
  onClose: () => void;
  onNavigate: (location: Location) => void;
  onStartMultiStop?: (location: Location) => void;
  onLoginClick?: () => void;
  onPromoteClick?: (location: Location) => void;
}

export const BottomSheet = ({ location, department, onClose, onNavigate, onStartMultiStop, onLoginClick, onPromoteClick }: BottomSheetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { isFavorite, addFavorite, removeFavorite, isAuthenticated } = useFavorites();
  const { menuItems, vouchers, isUserStore } = useStoreDetails(location?.id || null);

  if (!location) return null;
  
  const isLocationFavorite = isFavorite(location.id);
  
  const handleFavoriteClick = () => {
    if (!isAuthenticated && onLoginClick) {
      onLoginClick();
      return;
    }
    if (isLocationFavorite) {
      removeFavorite(location.id);
    } else {
      addFavorite(location);
    }
  };
  
  // Get localized content
  const locationName = language === 'en' && location.name ? location.name : location.nameVi;
  const locationDescription = language === 'en' && location.descriptionEn ? location.descriptionEn : location.description;
  const locationAddress = language === 'en' && location.addressEn ? location.addressEn : location.address;
  const locationOpenHours = language === 'en' && location.openHoursEn ? location.openHoursEn : location.openHours;
  const locationTags = language === 'en' && location.tagsEn ? location.tagsEn : location.tags;
  const voucherText = location.voucherTextKey ? t(location.voucherTextKey as any) : location.voucherText;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.velocity.y > 500 || info.offset.y > 150) {
      onClose();
    } else if (info.velocity.y < -500 || info.offset.y < -100) {
      setIsExpanded(true);
    }
  };

  const sheetHeight = isExpanded ? '85vh' : 'auto';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0, height: sheetHeight }}
        exit={{ y: '100%' }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="fixed bottom-0 left-0 right-0 z-50 bottom-sheet safe-bottom"
        style={{ maxHeight: '85vh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
          {/* Header with image */}
          <div className="relative -mx-5 mb-4">
            <img
              src={location.image}
              alt={locationName}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
            
            {/* Favorite button */}
            <button
              onClick={handleFavoriteClick}
              className={`absolute top-3 right-14 w-8 h-8 backdrop-blur rounded-full flex items-center justify-center shadow-lg transition-colors ${
                isLocationFavorite ? 'bg-red-500' : 'bg-white/90'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLocationFavorite ? 'text-white fill-white' : 'text-foreground'}`} />
            </button>

            {/* Voucher badge */}
            {location.hasVoucher && voucherText && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                <Sparkles className="w-4 h-4" />
                {voucherText}
              </div>
            )}

            {/* Title overlay */}
            <div className="absolute bottom-4 left-5 right-5">
              <div className="flex items-center gap-2 mb-1">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={language + locationName}
                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                    transition={{ duration: 0.25 }}
                    className="text-2xl font-bold text-white"
                  >
                    {locationName}
                  </motion.h2>
                </AnimatePresence>
                <LanguageIndicator className="bg-white/20 text-white border-0" />
              </div>
              {location.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-semibold text-sm">{location.rating}</span>
                  </div>
                  <AnimatedText as="span" className="text-white/80 text-sm">({t('reviewCount', { count: location.reviewCount || 0 })})</AnimatedText>
                </div>
              )}
            </div>
          </div>

          {/* Department highlight */}
          {department && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{department.name}</p>
                  <p className="text-sm text-primary font-medium">
                    {department.floor}
                    {department.room && ` • ${t('room')} ${department.room}`}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Info cards */}
          <AnimatedBlock className="space-y-3 mb-5">
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{locationAddress}</span>
            </div>
            {locationOpenHours && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{locationOpenHours}</span>
              </div>
            )}
            {location.phone && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{location.phone}</span>
              </div>
            )}
          </AnimatedBlock>

          {/* Description */}
          <AnimatedText as="p" className="text-foreground mb-5">{locationDescription}</AnimatedText>

          {/* Tags */}
          {locationTags && (
            <div className="flex flex-wrap gap-2 mb-5">
              {locationTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Departments list for buildings */}
          {location.departments && location.departments.length > 0 && !department && (
            <div className="mb-5">
              <h3 className="font-semibold text-foreground mb-3">{t('departments')}</h3>
              <div className="space-y-2">
                {location.departments.map((dept, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                  >
                    <span className="text-sm text-foreground">{dept.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {dept.floor}
                      {dept.room && ` • ${t('roomShort')}${dept.room}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Store Menu - for user stores */}
          {isUserStore && menuItems.length > 0 && (
            <div className="mb-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-primary" />
                Menu
              </h3>
              <div className="space-y-2">
                {menuItems.slice(0, isExpanded ? undefined : 4).map((item) => {
                  const itemName = language === 'en' && item.name_en ? item.name_en : item.name_vi;
                  const itemDesc = language === 'en' && item.description_en ? item.description_en : item.description_vi;
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      {item.image_url ? (
                        <img src={item.image_url} alt={itemName} className="w-14 h-14 rounded-lg object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                          <UtensilsCrossed className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{itemName}</p>
                        {itemDesc && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{itemDesc}</p>
                        )}
                        <p className="text-sm font-semibold text-primary mt-0.5">
                          {new Intl.NumberFormat('vi-VN').format(item.price)}đ
                        </p>
                      </div>
                    </div>
                  );
                })}
                {!isExpanded && menuItems.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{menuItems.length - 4} {language === 'vi' ? 'món khác' : 'more items'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Store Vouchers - for user stores */}
          {isUserStore && vouchers.length > 0 && (
            <div className="mb-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-accent" />
                Vouchers
              </h3>
              <div className="space-y-2">
                {vouchers.map((voucher) => {
                  const vTitle = language === 'en' && voucher.title_en ? voucher.title_en : voucher.title_vi;
                  const vDesc = language === 'en' && voucher.description_en ? voucher.description_en : voucher.description_vi;
                  const isCopied = copiedCode === voucher.code;
                  
                  const handleCopyCode = () => {
                    navigator.clipboard.writeText(voucher.code);
                    setCopiedCode(voucher.code);
                    toast.success(language === 'vi' ? 'Đã sao chép mã!' : 'Code copied!');
                    setTimeout(() => setCopiedCode(null), 2000);
                  };
                  
                  return (
                    <div key={voucher.id} className="p-3 bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl border border-accent/20">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs bg-accent/20 text-accent px-2 py-0.5 rounded font-semibold">
                              {voucher.code}
                            </span>
                            <button 
                              onClick={handleCopyCode}
                              className="p-1 hover:bg-muted rounded"
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                          <p className="text-sm font-medium text-foreground">{vTitle}</p>
                          {vDesc && (
                            <p className="text-xs text-muted-foreground mt-0.5">{vDesc}</p>
                          )}
                          <p className="text-xs text-accent font-medium mt-1">
                            {voucher.discount_type === 'percent' 
                              ? `${language === 'vi' ? 'Giảm' : 'Discount'} ${voucher.discount_value}%` 
                              : `${language === 'vi' ? 'Giảm' : 'Discount'} ${new Intl.NumberFormat('vi-VN').format(voucher.discount_value)}đ`
                            }
                            {voucher.min_order && voucher.min_order > 0 && (
                              <span className="text-muted-foreground">
                                {' '}• Min {new Intl.NumberFormat('vi-VN').format(voucher.min_order)}đ
                              </span>
                            )}
                          </p>
                        </div>
                        <Sparkles className="w-5 h-5 text-accent flex-shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews */}
          {location.reviews && location.reviews.length > 0 && (
            <div className="mb-5">
              <h3 className="font-semibold text-foreground mb-3">{t('reviews')}</h3>
              <div className="space-y-3">
                {location.reviews.map((review, index) => {
                  const reviewComment = language === 'en' && review.commentEn ? review.commentEn : review.comment;
                  return (
                    <div key={index} className="p-4 bg-muted/50 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{review.author}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{reviewComment}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => onNavigate(location)}
              className="flex-1 h-14 text-base font-semibold rounded-2xl bg-primary hover:bg-primary/90"
            >
              <Navigation className="w-5 h-5 mr-2" />
              {t('directions')}
            </Button>
            {onStartMultiStop && (
              <Button
                onClick={() => onStartMultiStop(location)}
                variant="outline"
                className="h-14 px-4 rounded-2xl border-2"
              >
                <Route className="w-5 h-5" />
              </Button>
            )}
            {onPromoteClick && (
              <Button
                onClick={() => {
                  if (!isAuthenticated && onLoginClick) {
                    onLoginClick();
                    return;
                  }
                  onPromoteClick(location);
                }}
                variant="outline"
                className="h-14 px-4 rounded-2xl border-2 border-accent hover:bg-accent/10"
                title={language === 'vi' ? 'Quảng cáo địa điểm này' : 'Promote this location'}
              >
                <Megaphone className="w-5 h-5 text-accent" />
              </Button>
            )}
          </div>

          {/* Expand hint */}
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full flex items-center justify-center gap-1 text-muted-foreground text-sm mt-4"
            >
              <ChevronUp className="w-4 h-4" />
              {t('seeMore')}
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
