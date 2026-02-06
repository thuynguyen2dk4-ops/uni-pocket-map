// src/pages/Index.tsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { GoogleAd } from '@/components/ads/GoogleAd';
// --- COMPONENTS ---
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
import { ClaimStoreModal } from '@/components/store/ClaimStoreModal';
// 1. IMPORT MAIN MENU
import { MainMenu } from '@/components/MainMenu'; 

// --- HOOKS & DATA ---
import { useLanguage } from '@/i18n/LanguageContext';
import { useDirections, TransportMode } from '@/hooks/useDirections';
import { useMultiStopDirections, Waypoint } from '@/hooks/useMultiStopDirections';
import { useRealtimeNavigation } from '@/hooks/useRealtimeNavigation';
import { useFavorites } from '@/hooks/useFavorites';
import { Location, LocationType, Department, locations } from '@/data/locations'; 

const Index = () => {
  const { t, language } = useLanguage();
  
  // Router Hooks
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [showSponsoredModal, setShowSponsoredModal] = useState(false);

  // State Modal Claim
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimData, setClaimData] = useState<{mapboxId: string, name: string, address?: string, lat: number, lng: number} | null>(null);
  
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

  // --- LOGIC URL SYNC ---
  useEffect(() => {
    if (!id) {
      setSelectedLocation(null);
      document.title = 'ThodiaUni - Bản đồ Đại học';
      return;
    }

    const foundLocation = locations.find(loc => String(loc.id) === id);
    
    if (foundLocation) {
      setSelectedLocation(foundLocation);
      setFlyToLocation(foundLocation);
      document.title = `${language === 'en' ? foundLocation.name : foundLocation.nameVi} | ThodiaUni`;
      return;
    }

    if (selectedLocation && String(selectedLocation.id) === id) {
       const name = language === 'en' && selectedLocation.name ? selectedLocation.name : selectedLocation.nameVi;
       document.title = `${name} | ThodiaUni`;
    } 

  }, [id, language]);

  // --- GPS Tracking ---
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

      if (calculatedWaypoints.length === 0 && routeDestination) {
          const prevName = navigationDestination || "Điểm dừng 1";
          const firstWaypoint: Waypoint = { coordinates: routeDestination, name: prevName };
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

      if (locationRef.current) {
          const originWaypoint: Waypoint = {
            coordinates: [locationRef.current.lng, locationRef.current.lat],
            name: language === 'vi' ? 'Vị trí của bạn' : 'Your location',
          };
          getMultiStopDirections(originWaypoint, calculatedWaypoints, multiStopTransportMode);
      }
      return;
    }
    
    // Chọn địa điểm
    setSelectedLocation(location);
    setFlyToLocation(location);
    if (department) setSelectedDepartment(department);

    navigate(`/place/${location.id}`);

  }, [isAddingStop, isMultiStopMode, isNavigating, addWaypoint, multiStopWaypoints, language, getMultiStopDirections, multiStopTransportMode, routeDestination, navigationDestination, clearDirections, navigate]);

  const handleClaimLocation = useCallback((location: Location) => {
    setClaimData({
      mapboxId: String(location.id),
      name: location.nameVi || location.name || "Địa điểm",
      address: location.address,
      lat: location.lat,
      lng: location.lng
    });
    setShowClaimModal(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    navigate('/'); 
    setSelectedDepartment(null);
  }, [navigate]);

  const handleNavigate = useCallback((location: Location, mode: TransportMode = 'walking') => {
    navigate('/');
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
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const originCoords: [number, number] = [position.coords.longitude, position.coords.latitude];
                setRouteOrigin(originCoords);
                getDirections(originCoords, destCoords, mode);
                setIsNavigating(true);
            }
        );
    }
  }, [getDirections, language, clearMultiStopRoute, navigate]);

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
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  }, []);
  
  const { 
    currentStepIndex, 
    distanceToNextStep, 
    isTracking, 
  } = useRealtimeNavigation({
    steps: route?.steps || [],
    routeGeometry: route?.geometry || null,
    isNavigating,
    userLocation: currentUserLocation,
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
    setShowSponsoredModal(true);
  }, []);

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
            {/* 2. SỬ DỤNG MAIN MENU THAY CHO NÚT LOGO CŨ */}
            <MainMenu>
               <div className="flex flex-col items-center justify-center cursor-pointer mr-2 group">
                 {/* Khung Logo */}
                 <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden border-2 border-green-700 group-hover:scale-105 transition-transform z-10">
                   <img src="/logo.png" alt="ThodiaUni Logo" className="w-full h-full object-cover" />
                 </div>
                 {/* Chữ MENU nhỏ xíu ở dưới */}
                 <span className="text-[9px] font-black text-white bg-green-700 px-2 py-[1px] rounded-sm -mt-2 z-20 shadow-sm tracking-wider border border-white uppercase">
                   Menu
                 </span>
               </div>
            </MainMenu>
            
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
                className="ml-2" // 3. THÊM MARGIN ĐỂ TRÁNH LOGO
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
            onClaim={handleClaimLocation} 
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
      
      <ClaimStoreModal 
        isOpen={showClaimModal} 
        onClose={() => setShowClaimModal(false)} 
        data={claimData}
      />

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
<GoogleAd slotId="8326440208" />
      <StoreManagementPanel
        isOpen={showStorePanel}
        onClose={() => setShowStorePanel(false)}
        onLoginClick={() => {
          setShowStorePanel(false);
          setShowAuthModal(true);
        }}
      />
      
      {!isNavigating && (
         // 4. TRUYỀN USER LOCATION CHO MINI SHOWCASE (THUẬT TOÁN MỚI)
         <MiniShowcase 
            onSelectLocation={handleSelectLocation} 
            userLocation={currentUserLocation}
         />
      )}
    </div>
  );
};

export default Index;