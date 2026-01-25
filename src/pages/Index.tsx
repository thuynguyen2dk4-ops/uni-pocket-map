// src/pages/Index.tsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { MiniShowcase } from '@/components/MiniShowcase';
import { MapView } from '@/components/MapView';
import { SearchBar } from '@/components/SearchBar'; 
import { CategoryFilter } from '@/components/CategoryFilter';
import { BottomSheet } from '@/components/BottomSheet';
import { DirectionsPanel } from '@/components/DirectionsPanel';
import { MultiStopPanel } from '@/components/MultiStopPanel';
import { AuthModal } from '@/components/AuthModal';
import { FavoritesPanel } from '@/components/FavoritesPanel';
import { StoreManagementPanel } from '@/components/store/StoreManagementPanel';
import { UserMenu } from '@/components/UserMenu';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { StoreDetailModal } from '@/components/store/StoreDetailModal';

import { useLanguage } from '@/i18n/LanguageContext';
import { useDirections, TransportMode, RoutePreference } from '@/hooks/useDirections';
import { useMultiStopDirections, Waypoint } from '@/hooks/useMultiStopDirections';
import { useRealtimeNavigation } from '@/hooks/useRealtimeNavigation';
import { useFavorites } from '@/hooks/useFavorites';
import { Location, LocationType, Department } from '@/data/locations';

const Index = () => {
  const { t, language } = useLanguage();
  
  // State Locations
  const [currentUserLocation, setCurrentUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const locationRef = useRef<{ lat: number; lng: number } | null>(null);
  const [detailLocation, setDetailLocation] = useState<Location | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [flyToLocation, setFlyToLocation] = useState<Location | null>(null);
  const [activeCategories, setActiveCategories] = useState<LocationType[]>([
    'building', 'food', 'housing', 'job', 
    'lecture_hall', 'office', 'cafe', 'entertainment', 'checkin'
  ]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMultiStopMode, setIsMultiStopMode] = useState(false);
  const [isAddingStop, setIsAddingStop] = useState(false);

  const [routeOrigin, setRouteOrigin] = useState<[number, number] | null>(null);
  const [routeDestination, setRouteDestination] = useState<[number, number] | null>(null);
  const [navigationDestination, setNavigationDestination] = useState<string>('');

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFavoritesPanel, setShowFavoritesPanel] = useState(false);
  const [showStorePanel, setShowStorePanel] = useState(false);
  const [showSponsoredModal, setShowSponsoredModal] = useState(false); // Used implicitly?
  
  const { favorites } = useFavorites();

  const { 
    route, isLoading, getDirections, clearDirections, transportMode, 
    setTransportMode, routePreference, setRoutePreference, origin, destination 
  } = useDirections();

  const {
    route: multiStopRoute, waypoints: multiStopWaypoints, isLoading: isMultiStopLoading,
    transportMode: multiStopTransportMode, addWaypoint, removeWaypoint, reorderWaypoints,
    getMultiStopDirections, clearRoute: clearMultiStopRoute, setTransportMode: setMultiStopTransportMode,
  } = useMultiStopDirections();

  // --- 1. SINGLE SOURCE OF TRUTH FOR GPS ---
  // Chỉ Index quản lý việc lấy vị trí và phân phối xuống dưới
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCurrentUserLocation(newLoc);
        locationRef.current = newLoc;
      },
      (error) => console.warn("Lỗi GPS:", error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleOpenDetail = useCallback((location: Location) => {
    setDetailLocation(location);
    setSelectedLocation(null);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailLocation(null);
  }, []);

  const handleAddStopFromDirections = useCallback(() => {
     setIsAddingStop(true); 
     setIsSearchFocused(true);
     toast.info(language === 'vi' ? 'Hãy chọn điểm đến tiếp theo' : 'Select the next stop');
  }, [language]);

  const handleSelectLocation = useCallback((location: Location, department?: Department) => {
    if (isAddingStop || isMultiStopMode) {
      const newWaypoint: Waypoint = {
        coordinates: [location.lng, location.lat],
        name: language === 'en' && location.name ? location.name : location.nameVi,
        location,
      };

      let calculatedWaypoints: Waypoint[] = [...multiStopWaypoints];

      // Nếu chuyển từ Single Route -> Multi Route, lấy điểm đích cũ làm điểm dừng đầu tiên
      if (calculatedWaypoints.length === 0 && routeDestination) {
          const prevName = navigationDestination || "Điểm dừng 1";
          const firstWaypoint: Waypoint = {
             coordinates: routeDestination,
             name: prevName,
             // Không có object location đầy đủ ở đây cũng không sao, chỉ cần tọa độ
          };
          calculatedWaypoints.push(firstWaypoint);
          addWaypoint(firstWaypoint);
      }

      calculatedWaypoints.push(newWaypoint);
      addWaypoint(newWaypoint);

      setIsAddingStop(false);
      setIsSearchFocused(false);
      
      if (isNavigating) {
          setIsNavigating(false);
          clearDirections();
      }
      setIsMultiStopMode(true);

      // Tính đường ngay
      if (locationRef.current) {
          const originWaypoint: Waypoint = {
            coordinates: [locationRef.current.lng, locationRef.current.lat],
            name: language === 'vi' ? 'Vị trí của bạn' : 'Your location',
          };
          getMultiStopDirections(originWaypoint, calculatedWaypoints, multiStopTransportMode);
      }
      return;
    }
    
    // Normal Selection
    setSelectedLocation(location);
    setSelectedDepartment(department || null);
    setFlyToLocation(location);

  }, [isAddingStop, isMultiStopMode, isNavigating, addWaypoint, multiStopWaypoints, language, getMultiStopDirections, multiStopTransportMode, routeDestination, navigationDestination, clearDirections]);

  const handleCloseSheet = useCallback(() => {
    setSelectedLocation(null);
    setSelectedDepartment(null);
  }, []);

  const handleNavigate = useCallback((location: Location, mode: TransportMode = 'walking') => {
    setSelectedLocation(null);
    setSelectedDepartment(null);
    setIsMultiStopMode(false);
    clearMultiStopRoute(); 

    const destCoords: [number, number] = [location.lng, location.lat];
    setRouteDestination(destCoords);

    if (locationRef.current) {
        const originCoords: [number, number] = [locationRef.current.lng, locationRef.current.lat];
        setRouteOrigin(originCoords);
        getDirections(originCoords, destCoords, mode);
        setIsNavigating(true);
    } else {
        toast.info(language === 'vi' ? 'Đang lấy vị trí...' : 'Locating...');
        // Fallback if locationRef is null (rare if GPS is on)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const originCoords: [number, number] = [position.coords.longitude, position.coords.latitude];
                setRouteOrigin(originCoords);
                getDirections(originCoords, destCoords, mode);
                setIsNavigating(true);
            }
        );
    }
  }, [getDirections, language, clearMultiStopRoute]);

  const handleNavigateWithName = useCallback((location: Location) => {
    const destName = language === 'en' && location.name ? location.name : location.nameVi;
    setNavigationDestination(destName);
    handleNavigate(location);
  }, [handleNavigate, language]);

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
        // Bỏ đoạn kiểm tra "if (prev.length === 1) return prev;" đi
        // Để cho phép người dùng tắt hết nếu muốn
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  }, []);
  // --- Realtime Nav ---
  const { 
    currentStepIndex, 
    distanceToNextStep, 
    isTracking, 
    // accuracy, // Có thể dùng nếu cần hiển thị độ chính xác
  } = useRealtimeNavigation({
    steps: route?.steps || [],
    routeGeometry: route?.geometry || null,
    isNavigating,
    userLocation: currentUserLocation, // TRUYỀN PROPS THAY VÌ TỰ TRACK
    onOffRoute: () => {
      if (locationRef.current && destination) {
         toast.warning(t('offRouteWarning'));
         const currentCoords: [number, number] = [locationRef.current.lng, locationRef.current.lat];
         setRouteOrigin(currentCoords);
         getDirections(currentCoords, destination, transportMode, routePreference);
      }
    },
  });

  const handleAddStopClick = useCallback(() => {
    setIsAddingStop(true);
    toast.info(language === 'vi' ? 'Chọn điểm dừng tiếp theo trên bản đồ' : 'Select next stop on the map');
  }, [language]);
  const handlePromoteLocation = useCallback((location: Location) => {
    // setPromotingLocation(location); // Giả sử bạn có state này nếu dùng StoreManagement
    setShowSponsoredModal(true);
    setSelectedLocation(null);
  }, []);
  const handleSelectCategory = (categories: LocationType[]) => { 
  setActiveCategories(categories);
}

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
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
          multiStopRoute={multiStopRoute}
          isMultiStopMode={isMultiStopMode}
          // Không cần onUserLocationUpdate nữa vì Index đã tự lo
        />
      </div>

      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/80 via-background/40 to-transparent pointer-events-none" />
      
      <div className="absolute top-0 left-0 right-0 safe-top z-[50]">
        <div className="px-3 pt-3">
          <motion.div 
            className="flex items-center gap-2 mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center overflow-hidden border-2 border-green-700 cursor-pointer hover:scale-105 transition-transform">
    <img 
      src="/logo.png" 
      alt="ThodiaUni Logo" 
      className="w-full h-full object-cover" 
    />
  </div>
            
            <div className="flex-1 min-w-0">
              <SearchBar
                onLocationSelect={handleSelectLocation} 
                userLocation={currentUserLocation}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
            
            <button
              onClick={() => setShowFavoritesPanel(true)}
              className="relative w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors shadow-sm"
            >
              <Heart className="w-5 h-5 text-muted-foreground" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {favorites.length > 9 ? '9+' : favorites.length}
                </span>
              )}
            </button>
            
            <UserMenu 
              onLoginClick={() => setShowAuthModal(true)} 
              onFavoritesClick={() => setShowFavoritesPanel(true)}
              onStoresClick={() => setShowStorePanel(true)}
            />
            
            <LanguageSwitcher compact />
          </motion.div>

          <AnimatePresence>
            {!isSearchFocused && !isNavigating && !isMultiStopMode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.2 }}
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

      <AnimatePresence>
        {isMultiStopMode && (
          <MultiStopPanel
            routeInfo={multiStopRoute}
            waypoints={multiStopWaypoints}
            isLoading={isMultiStopLoading}
            transportMode={multiStopTransportMode}
            onClose={handleClearRoute}
            onChangeTransportMode={(mode) => {
                setMultiStopTransportMode(mode);
                if (locationRef.current) {
                    const originWaypoint = { coordinates: [locationRef.current.lng, locationRef.current.lat] as [number, number], name: 'Your location' };
                    getMultiStopDirections(originWaypoint, multiStopWaypoints, mode);
                }
            }}
            onRemoveWaypoint={(index) => {
                removeWaypoint(index);
                const updatedWaypoints = multiStopWaypoints.filter((_, i) => i !== index);
                if (updatedWaypoints.length === 0) handleClearRoute();
                else if (locationRef.current) {
                    const originWaypoint = { coordinates: [locationRef.current.lng, locationRef.current.lat] as [number, number], name: 'Your location' };
                    getMultiStopDirections(originWaypoint, updatedWaypoints, multiStopTransportMode);
                }
            }}
            onReorderWaypoints={reorderWaypoints}
            onAddStop={handleAddStopClick}
            isAddingStop={isAddingStop}
          />
        )}
      </AnimatePresence>

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
            userAccuracy={null}
            onClose={handleClearRoute}
            onChangeTransportMode={(mode) => {
                setTransportMode(mode);
                if (origin && destination) getDirections(origin, destination, mode, routePreference);
            }}
            onChangeRoutePreference={(pref) => {
                setRoutePreference(pref);
                if (origin && destination) getDirections(origin, destination, transportMode, pref);
            }}
            onAddStop={handleAddStopFromDirections}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedLocation && !isMultiStopMode && (
          <BottomSheet
            location={selectedLocation}
            department={selectedDepartment}
            onClose={handleCloseSheet}
            onNavigate={handleNavigateWithName}
            onOpenDetail={handleOpenDetail}
            onLoginClick={() => setShowAuthModal(true)}
            onPromoteClick={handlePromoteLocation}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailLocation && (
           <StoreDetailModal 
              location={detailLocation}
              isOpen={!!detailLocation}
              onClose={handleCloseDetail}
              onNavigate={() => handleNavigateWithName(detailLocation)}
           />
        )}
      </AnimatePresence>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <FavoritesPanel
        isOpen={showFavoritesPanel}
        onClose={() => setShowFavoritesPanel(false)}
        onSelectLocation={handleSelectLocation}
        onNavigate={handleNavigateWithName}
        onLoginClick={() => {
          setShowFavoritesPanel(false);
          setShowAuthModal(true);
        }}
      />

      <StoreManagementPanel
        isOpen={showStorePanel}
        onClose={() => setShowStorePanel(false)}
        onLoginClick={() => {
          setShowStorePanel(false);
          setShowAuthModal(true);
        }}
      />
      {/* Chỉ hiện khi không đang dẫn đường */}
      {!isNavigating && (
         <MiniShowcase onSelectLocation={handleSelectLocation} />
      )}
    </div>
  );
};

export default Index;