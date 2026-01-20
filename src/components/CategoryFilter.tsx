import { motion } from 'framer-motion';
import { Building2, Coffee, Home, Briefcase, MapPin } from 'lucide-react';
import { LocationType } from '@/data/locations';

interface CategoryFilterProps {
  activeCategories: LocationType[];
  onToggleCategory: (category: LocationType) => void;
}

const categories: { type: LocationType | 'all'; label: string; icon: typeof Building2 }[] = [
  { type: 'all', label: 'Tất cả', icon: MapPin },
  { type: 'building', label: 'Tòa nhà', icon: Building2 },
  { type: 'food', label: 'Ẩm thực', icon: Coffee },
  { type: 'housing', label: 'Nhà trọ', icon: Home },
  { type: 'job', label: 'Việc làm', icon: Briefcase },
];

export const CategoryFilter = ({ activeCategories, onToggleCategory }: CategoryFilterProps) => {
  const allActive = activeCategories.length === 4;

  const handleClick = (type: LocationType | 'all') => {
    if (type === 'all') {
      // Toggle all categories
      if (allActive) {
        // If all are active, keep them active (clicking "all" when all are selected does nothing)
      } else {
        // Enable all categories
        const allTypes: LocationType[] = ['building', 'food', 'housing', 'job'];
        allTypes.forEach(t => {
          if (!activeCategories.includes(t)) {
            onToggleCategory(t);
          }
        });
      }
    } else {
      onToggleCategory(type);
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map(({ type, label, icon: Icon }) => {
        const isActive = type === 'all' ? allActive : activeCategories.includes(type as LocationType);
        
        return (
          <motion.button
            key={type}
            onClick={() => handleClick(type)}
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
            <span>{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
