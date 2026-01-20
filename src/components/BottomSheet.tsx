import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Navigation, Star, Clock, Phone, MapPin, Sparkles, ChevronUp } from 'lucide-react';
import { Location, Department } from '@/data/locations';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

interface BottomSheetProps {
  location: Location | null;
  department?: Department | null;
  onClose: () => void;
  onNavigate: (location: Location) => void;
}

export const BottomSheet = ({ location, department, onClose, onNavigate }: BottomSheetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, language } = useLanguage();

  if (!location) return null;
  
  // Get localized name
  const locationName = language === 'en' && location.name ? location.name : location.nameVi;

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

            {/* Voucher badge */}
            {location.hasVoucher && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                <Sparkles className="w-4 h-4" />
                {location.voucherText}
              </div>
            )}

            {/* Title overlay */}
            <div className="absolute bottom-4 left-5 right-5">
              <h2 className="text-2xl font-bold text-white mb-1">{locationName}</h2>
              {location.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-semibold text-sm">{location.rating}</span>
                  </div>
                  <span className="text-white/80 text-sm">({t('reviewCount', { count: location.reviewCount || 0 })})</span>
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
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{location.address}</span>
            </div>
            {location.openHours && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{location.openHours}</span>
              </div>
            )}
            {location.phone && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{location.phone}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-foreground mb-5">{location.description}</p>

          {/* Tags */}
          {location.tags && (
            <div className="flex flex-wrap gap-2 mb-5">
              {location.tags.map((tag) => (
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

          {/* Reviews */}
          {location.reviews && location.reviews.length > 0 && (
            <div className="mb-5">
              <h3 className="font-semibold text-foreground mb-3">{t('reviews')}</h3>
              <div className="space-y-3">
                {location.reviews.map((review, index) => (
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
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action button */}
          <Button
            onClick={() => onNavigate(location)}
            className="w-full h-14 text-base font-semibold rounded-2xl bg-primary hover:bg-primary/90"
          >
            <Navigation className="w-5 h-5 mr-2" />
            {t('directions')}
          </Button>

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
