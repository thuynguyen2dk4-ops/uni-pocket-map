import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapView } from '@/components/MapView';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { BottomSheet } from '@/components/BottomSheet';
import { Location, LocationType, Department } from '@/data/locations';
import { Compass, Menu } from 'lucide-react';

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [flyToLocation, setFlyToLocation] = useState<Location | null>(null);
  const [activeCategories, setActiveCategories] = useState<LocationType[]>([
    'building', 'food', 'housing', 'job'
  ]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSelectLocation = useCallback((location: Location, department?: Department) => {
    setSelectedLocation(location);
    setSelectedDepartment(department || null);
    setFlyToLocation(location);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedLocation(null);
    setSelectedDepartment(null);
  }, []);

  const handleNavigate = useCallback((location: Location) => {
    // In a real app, this would open navigation
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    window.open(url, '_blank');
  }, []);

  const handleToggleCategory = useCallback((category: LocationType) => {
    setActiveCategories(prev => {
      if (prev.includes(category)) {
        // Don't allow deselecting all categories
        if (prev.length === 1) return prev;
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <MapView
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          activeCategories={activeCategories}
          flyToLocation={flyToLocation}
        />
      </div>

      {/* Overlay gradient for better readability */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/80 via-background/40 to-transparent pointer-events-none" />

      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 safe-top">
        <div className="px-4 pt-4">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Compass className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">UniPocket</h1>
                <p className="text-xs text-muted-foreground">Campus & Lifestyle Map</p>
              </div>
            </div>
            <button className="w-10 h-10 bg-card rounded-xl flex items-center justify-center shadow-lg">
              <Menu className="w-5 h-5 text-foreground" />
            </button>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SearchBar
              onSelectLocation={handleSelectLocation}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </motion.div>

          {/* Category filter */}
          <AnimatePresence>
            {!isSearchFocused && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.3 }}
                className="mt-3"
              >
                <CategoryFilter
                  activeCategories={activeCategories}
                  onToggleCategory={handleToggleCategory}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sponsored banner - floating */}
      <AnimatePresence>
        {!selectedLocation && !isSearchFocused && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-4 right-4 safe-bottom"
          >
            <div className="bg-gradient-to-r from-accent to-orange-400 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">☕</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80">Được tài trợ</p>
                  <p className="text-white font-semibold">Highlands Coffee - Giảm 20% cho sinh viên</p>
                </div>
                <button className="px-4 py-2 bg-white rounded-xl text-accent font-semibold text-sm shadow-lg">
                  Xem ngay
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom sheet */}
      <AnimatePresence>
        {selectedLocation && (
          <BottomSheet
            location={selectedLocation}
            department={selectedDepartment}
            onClose={handleCloseSheet}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>

      {/* Overlay when search is focused */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm z-40"
            style={{ top: '140px' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
