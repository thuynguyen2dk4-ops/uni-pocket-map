import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapView } from '@/components/MapView';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { BottomSheet } from '@/components/BottomSheet';
import { DirectionsPanel } from '@/components/DirectionsPanel';
import { MultiStopPanel } from '@/components/MultiStopPanel';
import { Location, LocationType, Department } from '@/data/locations';
import { Compass, Menu } from 'lucide-react';
import { LanguageSwitcher, LanguageIndicator } from '@/components/LanguageSwitcher';
import { AnimatedText } from '@/components/AnimatedText';
import { useLanguage } from '@/i18n/LanguageContext';
import { useDirections, TransportMode, RoutePreference } from '@/hooks/useDirections';
import { useMultiStopDirections, Waypoint } from '@/hooks/useMultiStopDirections';
import { useRealtimeNavigation } from '@/hooks/useRealtimeNavigation';
import { toast } from 'sonner';

const Index = () => {
  const { t, language } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [flyToLocation, setFlyToLocation] = useState<Location | null>(null);
  const [activeCategories, setActiveCategories] = useState<LocationType[]>([
    'building', 'food', 'housing', 'job'
  ]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMultiStopMode, setIsMultiStopMode] = useState(false);
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [routeOrigin, setRouteOrigin] = useState<[number, number] | null>(null);
  const [routeDestination, setRouteDestination] = useState<[number, number] | null>(null);
  
  const { route, isLoading, getDirections, clearDirections, transportMode, setTransportMode, routePreference, setRoutePreference, origin, destination } = useDirections();
  
  // Multi-stop directions
  const {
    route: multiStopRoute,
    waypoints: multiStopWaypoints,
    isLoading: isMultiStopLoading,
    transportMode: multiStopTransportMode,
    addWaypoint,
    removeWaypoint,
    reorderWaypoints,
    getMultiStopDirections,
    clearRoute: clearMultiStopRoute,
    setTransportMode: setMultiStopTransportMode,
  } = useMultiStopDirections();

  const handleSelectLocation = useCallback((location: Location, department?: Department) => {
    // If we're in add stop mode, add this location as a waypoint
    if (isAddingStop && isMultiStopMode) {
      const waypoint: Waypoint = {
        coordinates: [location.lng, location.lat],
        name: language === 'en' && location.name ? location.name : location.nameVi,
        location,
      };
      addWaypoint(waypoint);
      setIsAddingStop(false);
      
      // Get updated route
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const originWaypoint: Waypoint = {
              coordinates: [position.coords.longitude, position.coords.latitude],
              name: language === 'vi' ? 'Vị trí của bạn' : 'Your location',
            };
            getMultiStopDirections(originWaypoint, [...multiStopWaypoints, waypoint], multiStopTransportMode);
          },
          () => {
            toast.error(t('locationError'));
          }
        );
      }
      return;
    }
    
    setSelectedLocation(location);
    setSelectedDepartment(department || null);
    setFlyToLocation(location);
  }, [isAddingStop, isMultiStopMode, addWaypoint, language, getMultiStopDirections, multiStopWaypoints, multiStopTransportMode, t]);

  const handleCloseSheet = useCallback(() => {
    setSelectedLocation(null);
    setSelectedDepartment(null);
  }, []);

  const handleNavigate = useCallback((location: Location, mode: TransportMode = 'walking') => {
    // Get user's current location and calculate route
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const originCoords: [number, number] = [position.coords.longitude, position.coords.latitude];
          const destinationCoords: [number, number] = [location.lng, location.lat];
          setRouteOrigin(originCoords);
          setRouteDestination(destinationCoords);
          getDirections(originCoords, destinationCoords, mode);
          setIsNavigating(true);
          setSelectedLocation(null);
          setSelectedDepartment(null);
        },
        (err) => {
          toast.error(t('locationError'));
          console.error('Geolocation error:', err);
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error(t('browserNoLocation'));
    }
  }, [getDirections]);

  const handleChangeTransportMode = useCallback((mode: TransportMode) => {
    setTransportMode(mode);
    // Re-fetch directions with new mode if we have origin and destination
    if (origin && destination) {
      getDirections(origin, destination, mode, routePreference);
    }
  }, [getDirections, origin, destination, setTransportMode, routePreference]);

  const handleChangeRoutePreference = useCallback((preference: RoutePreference) => {
    setRoutePreference(preference);
    // Re-fetch directions with new preference if we have origin and destination
    if (origin && destination) {
      getDirections(origin, destination, transportMode, preference);
    }
  }, [getDirections, origin, destination, setRoutePreference, transportMode]);

  const handleClearRoute = useCallback(() => {
    clearDirections();
    setRouteOrigin(null);
    setRouteDestination(null);
    setIsNavigating(false);
    setIsMultiStopMode(false);
    clearMultiStopRoute();
  }, [clearDirections, clearMultiStopRoute]);

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

  // Track destination name for directions panel
  const [navigationDestination, setNavigationDestination] = useState<string>('');

  // Real-time navigation
  const { 
    currentStepIndex, 
    distanceToNextStep, 
    isTracking, 
    accuracy: userAccuracy,
    isOffRoute 
  } = useRealtimeNavigation({
    steps: route?.steps || [],
    routeGeometry: route?.geometry || null,
    isNavigating,
    onOffRoute: () => {
      toast.warning(t('offRouteWarning'));
      // Re-fetch directions if off route
      if (origin && destination) {
        getDirections(origin, destination, transportMode, routePreference);
      }
    },
  });

  const handleNavigateWithName = useCallback((location: Location) => {
    const destName = language === 'en' && location.name ? location.name : location.nameVi;
    setNavigationDestination(destName);
    handleNavigate(location);
  }, [handleNavigate, language]);

  // Start multi-stop navigation
  const handleStartMultiStop = useCallback((location: Location) => {
    const destName = language === 'en' && location.name ? location.name : location.nameVi;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const originWaypoint: Waypoint = {
            coordinates: [position.coords.longitude, position.coords.latitude],
            name: language === 'vi' ? 'Vị trí của bạn' : 'Your location',
          };
          const destWaypoint: Waypoint = {
            coordinates: [location.lng, location.lat],
            name: destName,
            location,
          };
          addWaypoint(destWaypoint);
          getMultiStopDirections(originWaypoint, [destWaypoint], 'walking');
          setIsMultiStopMode(true);
          setSelectedLocation(null);
          setSelectedDepartment(null);
        },
        (err) => {
          toast.error(t('locationError'));
          console.error('Geolocation error:', err);
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error(t('browserNoLocation'));
    }
  }, [language, addWaypoint, getMultiStopDirections, t]);

  const handleAddStopClick = useCallback(() => {
    setIsAddingStop(true);
    toast.info(language === 'vi' ? 'Chọn điểm dừng tiếp theo trên bản đồ' : 'Select next stop on the map');
  }, [language]);

  const handleRemoveWaypoint = useCallback((index: number) => {
    removeWaypoint(index);
    // Recalculate route
    const updatedWaypoints = multiStopWaypoints.filter((_, i) => i !== index);
    if (updatedWaypoints.length > 0 && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const originWaypoint: Waypoint = {
          coordinates: [position.coords.longitude, position.coords.latitude],
          name: language === 'vi' ? 'Vị trí của bạn' : 'Your location',
        };
        getMultiStopDirections(originWaypoint, updatedWaypoints, multiStopTransportMode);
      });
    } else if (updatedWaypoints.length === 0) {
      handleClearRoute();
    }
  }, [removeWaypoint, multiStopWaypoints, language, getMultiStopDirections, multiStopTransportMode, handleClearRoute]);

  const handleMultiStopTransportChange = useCallback((mode: TransportMode) => {
    setMultiStopTransportMode(mode);
    if (multiStopWaypoints.length > 0 && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const originWaypoint: Waypoint = {
          coordinates: [position.coords.longitude, position.coords.latitude],
          name: language === 'vi' ? 'Vị trí của bạn' : 'Your location',
        };
        getMultiStopDirections(originWaypoint, multiStopWaypoints, mode);
      });
    }
  }, [setMultiStopTransportMode, multiStopWaypoints, language, getMultiStopDirections]);

  const handleReorderWaypoints = useCallback((newOrder: Waypoint[]) => {
    // Recalculate route with new order
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const originWaypoint: Waypoint = {
          coordinates: [position.coords.longitude, position.coords.latitude],
          name: language === 'vi' ? 'Vị trí của bạn' : 'Your location',
        };
        getMultiStopDirections(originWaypoint, newOrder, multiStopTransportMode);
      });
    }
  }, [language, getMultiStopDirections, multiStopTransportMode]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <MapView
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          activeCategories={activeCategories}
          flyToLocation={flyToLocation}
          routeInfo={route}
          routeOrigin={routeOrigin}
          routeDestination={routeDestination}
          onClearRoute={handleClearRoute}
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
                <AnimatedText as="h1" className="text-lg font-bold text-foreground">{t('appName')}</AnimatedText>
                <AnimatedText as="p" className="text-xs text-muted-foreground">{t('appTagline')}</AnimatedText>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
            </div>
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
            {!isSearchFocused && !isNavigating && (
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

      {/* Multi-stop panel */}
      <AnimatePresence>
        {isMultiStopMode && (
          <MultiStopPanel
            routeInfo={multiStopRoute}
            waypoints={multiStopWaypoints}
            isLoading={isMultiStopLoading}
            transportMode={multiStopTransportMode}
            onClose={handleClearRoute}
            onChangeTransportMode={handleMultiStopTransportChange}
            onRemoveWaypoint={handleRemoveWaypoint}
            onReorderWaypoints={handleReorderWaypoints}
            onAddStop={handleAddStopClick}
            isAddingStop={isAddingStop}
          />
        )}
      </AnimatePresence>

      {/* Directions panel */}
      <AnimatePresence>
        {isNavigating && route && !isMultiStopMode && (
          <DirectionsPanel
            routeInfo={route}
            destinationName={navigationDestination}
            isLoading={isLoading}
            transportMode={transportMode}
            routePreference={routePreference}
            currentStepIndex={currentStepIndex}
            distanceToNextStep={distanceToNextStep}
            isTracking={isTracking}
            userAccuracy={userAccuracy}
            onClose={handleClearRoute}
            onChangeTransportMode={handleChangeTransportMode}
            onChangeRoutePreference={handleChangeRoutePreference}
          />
        )}
      </AnimatePresence>

      {/* Sponsored banner - floating */}
      <AnimatePresence>
        {!selectedLocation && !isSearchFocused && !isNavigating && !isMultiStopMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-4 right-4 safe-bottom"
          >
            <div className="bg-gradient-to-r from-accent to-accent/70 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent-foreground/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">☕</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <AnimatedText as="p" className="text-sm font-medium text-accent-foreground/80">{t('sponsored')}</AnimatedText>
                    <LanguageIndicator />
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={language}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="text-accent-foreground font-semibold"
                    >
                      {language === 'en' 
                        ? 'Highlands Coffee - 20% off for students'
                        : 'Highlands Coffee - Giảm 20% cho sinh viên'
                      }
                    </motion.p>
                  </AnimatePresence>
                </div>
                <button className="px-4 py-2 bg-background rounded-xl text-accent font-semibold text-sm shadow-lg">
                  {t('viewNow')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom sheet */}
      <AnimatePresence>
        {selectedLocation && !isMultiStopMode && (
          <BottomSheet
            location={selectedLocation}
            department={selectedDepartment}
            onClose={handleCloseSheet}
            onNavigate={handleNavigateWithName}
            onStartMultiStop={handleStartMultiStop}
          />
        )}
      </AnimatePresence>

      {/* Overlay when search is focused or adding stop */}
      <AnimatePresence>
        {(isSearchFocused || isAddingStop) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm z-40 pointer-events-none"
            style={{ top: '140px' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
