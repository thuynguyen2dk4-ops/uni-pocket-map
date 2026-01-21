import { motion } from 'framer-motion';
import { Building2, Coffee, Home, Briefcase } from 'lucide-react';
import { LocationType } from '@/data/locations';
import { useLanguage } from '@/i18n/LanguageContext';
import { TranslationKey } from '@/i18n/translations';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  activeCategories: LocationType[];
  onToggleCategory: (category: LocationType) => void;
}

export const CategoryFilter = ({ activeCategories, onToggleCategory }: CategoryFilterProps) => {
  const { t } = useLanguage();
  
  const categories: { type: LocationType; labelKey: TranslationKey; icon: typeof Building2 }[] = [
    { type: 'building', labelKey: 'categoryBuilding', icon: Building2 },
    { type: 'food', labelKey: 'categoryFood', icon: Coffee },
    { type: 'housing', labelKey: 'categoryHousing', icon: Home },
    { type: 'job', labelKey: 'categoryJob', icon: Briefcase },
  ];

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map(({ type, labelKey, icon: Icon }) => {
        const isActive = activeCategories.includes(type);
        
        return (
          <motion.button
            key={type}
            onClick={() => onToggleCategory(type)}
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
