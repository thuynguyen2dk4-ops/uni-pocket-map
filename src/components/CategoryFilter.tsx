import { motion } from 'framer-motion';
import { Building2, Coffee, Home, Briefcase } from 'lucide-react';
import { LocationType } from '@/data/locations';
import { useLanguage } from '@/i18n/LanguageContext';
import { TranslationKey } from '@/i18n/translations';

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
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map(({ type, labelKey, icon: Icon }) => {
        const isActive = activeCategories.includes(type);
        
        return (
          <motion.button
            key={type}
            onClick={() => onToggleCategory(type)}
            className={`category-chip flex-shrink-0 ${
              isActive ? 'category-chip-active' : 'category-chip-inactive'
            }`}
            whileTap={{ scale: 0.95 }}
            animate={{
              backgroundColor: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
              color: isActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
            }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="w-4 h-4" />
            <span>{t(labelKey)}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
