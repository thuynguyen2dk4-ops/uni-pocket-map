import { motion } from 'framer-motion';
import { Building2, Utensils, Home, Briefcase, MapPin, Coffee, GraduationCap, Building, Gamepad2 } from 'lucide-react';
import { LocationType } from '@/data/locations';
import { useLanguage } from '@/i18n/LanguageContext';
import { TranslationKey } from '@/i18n/translations';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  activeCategories: LocationType[];
  onToggleCategory: (category: LocationType) => void;
}
const allTypes: LocationType[] = [
    'building', 'food', 'housing', 'job', 
    'lecture_hall', 'office', 'cafe', 'entertainment', 'checkin'
  ];
export const CategoryFilter = ({ activeCategories, onToggleCategory }: CategoryFilterProps) => {
  const { t } = useLanguage();
  
  const categories: { type: LocationType | 'all'; labelKey: TranslationKey; icon: any }[] = [
    { type: 'lecture_hall', labelKey: 'lecture_hall', icon: GraduationCap }, 
    { type: 'office', labelKey: 'office', icon: Building },                 // Văn phòng
    { type: 'food', labelKey: 'food', icon: Utensils },                     // Quán ăn
    { type: 'cafe', labelKey: 'cafe', icon: Coffee },                       // Café
    { type: 'entertainment', labelKey: 'entertainment', icon: Gamepad2 },   // Khu vui chơi
    { type: 'housing', labelKey: 'housing', icon: Home },                   // Nhà trọ
    { type: 'job', labelKey: 'job', icon: Briefcase },          
    { type: 'building', labelKey: 'building', icon: Building2 },
  ];

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map(({ type, labelKey, icon: Icon }) => {
        const isActive = activeCategories.includes(type as LocationType);
        
        return (
          <motion.button
            key={type}
            onClick={() => onToggleCategory(type as LocationType)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              isActive 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-card/90 backdrop-blur-sm text-muted-foreground border border-border hover:bg-muted"
            )}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{t(labelKey)}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
