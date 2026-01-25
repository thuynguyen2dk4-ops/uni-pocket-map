import { useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// --- IMPORT ICON TỪ LUCIDE ---
import { 
  School, Utensils, Home, Briefcase, MapPin, Star, 
  Coffee, GraduationCap, Building, Gamepad2, Building2, UserCheck
} from 'lucide-react';

import { Location, VNU_CENTER, locations, LocationType } from '@/data/locations';
import { RouteInfo } from '@/hooks/useDirections';
import { MultiStopRouteInfo } from '@/hooks/useMultiStopDirections';
import { useApprovedStores } from '@/hooks/useApprovedStores';
import { getMapboxToken } from '@/lib/mapboxToken';
import { MapboxTokenPrompt } from '@/components/map/MapboxTokenPrompt';
import { useLanguage } from '@/i18n/LanguageContext';
import { NearbyVoucherBanner } from './NearbyVoucherBanner';

interface MapViewProps {
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
  activeCategories: LocationType[];
  flyToLocation?: Location | null;
  routeOrigin?: [number, number] | null;
  routeDestination?: [number, number] | null;
  onClearRoute?: () => void;
  onUserLocationUpdate?: (location: { lat: number; lng: number }) => void;
  routeInfo: RouteInfo | null;
  multiStopRoute: MultiStopRouteInfo | null;
  isMultiStopMode: boolean;
}

// --- COMPONENT RENDER ICON MARKER ---
const MarkerIcon = ({ type, isSelected, isSponsored, hasVoucher }: { type: LocationType, isSelected: boolean, isSponsored: boolean, hasVoucher?: boolean }) => {
  // Cấu hình Icon và Màu sắc mặc định
  let Icon = MapPin;
  let color = '#64748B'; 
  let bg = '#F8FAFC';

  // --- LOGIC CHỌN ICON THEO DANH MỤC ---
  switch (type) {
    case 'lecture_hall': 
      Icon = GraduationCap; 
      color = '#0EA5E9'; // Xanh dương trời (Sky)
      bg = '#E0F2FE'; 
      break;
    case 'office': 
      Icon = Building; 
      color = '#475569'; // Xám đậm (Slate)
      bg = '#F1F5F9'; 
      break;
    case 'cafe': 
      Icon = Coffee; 
      color = '#D97706'; // Nâu cam (Amber)
      bg = '#FEF3C7'; 
      break;
    case 'entertainment': 
      Icon = Gamepad2; 
      color = '#DB2777'; // Hồng đậm (Pink)
      bg = '#FCE7F3'; 
      break;
    case 'food': 
      Icon = Utensils; 
      color = '#F97316'; // Cam (Orange)
      bg = '#FFF7ED'; 
      break;
    case 'housing': 
      Icon = Home; 
      color = '#3B82F6'; // Xanh dương (Blue)
      bg = '#EFF6FF'; 
      break;
    case 'job': 
      Icon = Briefcase; 
      color = '#8B5CF6'; // Tím (Violet)
      bg = '#F5F3FF'; 
      break;
    case 'building': 
      Icon = Building2; 
      color = '#10B981'; // Xanh lá (Emerald)
      bg = '#ECFDF5'; 
      break;
    case 'checkin':
      Icon = UserCheck;
      color = '#EC4899'; // Hồng (Pink)
      bg = '#FDF2F8';
      break;
    default:
      Icon = MapPin;
      color = '#64748B';
      bg = '#F8FAFC';
  }

  const size = isSelected ? 48 : (isSponsored ? 42 : 36);
  const iconSize = isSelected ? 24 : (isSponsored ? 20 : 18);

  return (
    <div className="relative flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer"
         style={{ transform: isSelected ? 'scale(1.15) translateY(-10px)' : 'scale(1)' }}>
      
      {/* 1. Vòng tròn Icon */}
      <div style={{
        width: size, height: size,
        backgroundColor: isSelected ? color : 'white',
        border: `2.5px solid ${isSelected ? 'white' : color}`,
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isSelected 
          ? `0 10px 25px -5px ${color}90` 
          : '0 4px 6px -1px rgba(0,0,0,0.15)',
        zIndex: isSelected ? 50 : 10
      }}>
        <Icon size={iconSize} color={isSelected ? 'white' : color} strokeWidth={2.5} />
      </div>

      {/* 2. Mũi nhọn (Pin tail) */}
      {!isSelected && (
        <div style={{
          width: 0, height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `8px solid ${color}`,
          marginTop: -1,
          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
        }} />
      )}

      {/* 3. Sao Voucher (Nảy nảy) */}
      {hasVoucher && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 border-2 border-white rounded-full p-0.5 shadow-sm animate-bounce z-[60]">
          <Star size={12} fill="white" className="text-white" />
        </div>
      )}
    </div>
  );
};

export const MapView = ({ 
  selectedLocation, 
  onSelectLocation, 
  activeCategories,
  flyToLocation,
  routeInfo,
  routeOrigin,
  routeDestination,
  multiStopRoute,
  isMultiStopMode,
  onUserLocationUpdate,
}: MapViewProps) => {
  const { language } = useLanguage();
  const { storesAsLocations } = useApprovedStores();
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  const markersRef = useRef<{ marker: mapboxgl.Marker, root: Root }[]>([]);
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const tempMarkerRef = useRef<mapboxgl.Marker | null>(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxToken, setMapboxTokenState] = useState<string | null>(null);
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const routeLayerId = 'route-line';
  const routeArrowLayerId = 'route-arrows';
  const routeSourceId = 'route-source';

  useEffect(() => {
    const token = getMapboxToken();
    if (token) setMapboxTokenState(token);
    setIsTokenChecked(true);
  }, []);

  const handleSaveToken = (token: string) => {
    setMapboxTokenState(token);
  };

  // 1. KHỞI TẠO MAP
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [VNU_CENTER.lng, VNU_CENTER.lat],
      zoom: 16,
      pitch: 45,
      bearing: -17.6,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.current.addControl(geolocateControl, 'bottom-right');

    geolocateControl.on('geolocate', (e: any) => {
      const coords = { lat: e.coords.latitude, lng: e.coords.longitude };
      setUserLocation(coords); 
      if (onUserLocationUpdate) onUserLocationUpdate(coords);
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      geolocateControl.trigger(); 
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  // 2. VẼ MARKER ICON
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear markers cũ
    markersRef.current.forEach(({ marker, root }) => {
      root.unmount();
      marker.remove();
    });
    markersRef.current = [];

    // Gộp dữ liệu có sẵn + cửa hàng người dùng
    const allLocations = [...locations, ...storesAsLocations];
    // Lọc theo danh mục đang chọn
    const filteredLocations = allLocations.filter(loc => activeCategories.includes(loc.type));

    filteredLocations.forEach((location) => {
      const el = document.createElement('div');
      el.className = 'custom-marker-container';
      
      const root = createRoot(el);
      const isSelected = selectedLocation?.id === location.id;
      
      // Render React Component vào Marker
      root.render(
        <MarkerIcon 
          type={location.type} 
          isSelected={isSelected} 
          isSponsored={location.isSponsored || false}
          hasVoucher={location.hasVoucher}
        />
      );

      // Label tên địa điểm (khi chọn hoặc là Tòa nhà)
      if (location.type === 'building' || isSelected) {
        const nameEl = document.createElement('div');
        const nameText = language === 'en' && location.name ? location.name : location.nameVi;
        nameEl.innerHTML = `<div class="px-2 py-1 bg-slate-900/90 text-white text-[10px] font-bold rounded shadow-lg backdrop-blur-sm mt-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 relative">${nameText}</div>`;
        el.appendChild(nameEl);
      }

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectLocation(location);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([location.lng, location.lat])
        .addTo(map.current!);

      markersRef.current.push({ marker, root });
    });

  }, [activeCategories, mapLoaded, selectedLocation, onSelectLocation, language, storesAsLocations]);

  // 3. FLY TO KHI CHỌN
  useEffect(() => {
    if (!map.current || !flyToLocation) return;
    map.current.flyTo({
      center: [flyToLocation.lng, flyToLocation.lat],
      zoom: 18,
      pitch: 60,
      duration: 1500,
    });
  }, [flyToLocation]);

  // 4. VẼ ĐƯỜNG ĐI (ROUTE)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    // Cleanup Layers cũ
    if (map.current.getLayer(routeArrowLayerId)) map.current.removeLayer(routeArrowLayerId);
    if (map.current.getLayer(routeLayerId)) map.current.removeLayer(routeLayerId);
    if (map.current.getSource(routeSourceId)) map.current.removeSource(routeSourceId);
    if (originMarkerRef.current) { originMarkerRef.current.remove(); originMarkerRef.current = null; }
    if (destinationMarkerRef.current) { destinationMarkerRef.current.remove(); destinationMarkerRef.current = null; }

    const activeRouteData = isMultiStopMode ? multiStopRoute : routeInfo;
    if (!activeRouteData?.geometry) return;

    map.current.addSource(routeSourceId, {
      type: 'geojson',
      data: { type: 'Feature', properties: {}, geometry: activeRouteData.geometry },
    });
    
    map.current.addLayer({
      id: routeLayerId, type: 'line', source: routeSourceId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': isMultiStopMode ? '#8b5cf6' : '#3b82f6', 'line-width': 6, 'line-opacity': 0.8 },
    });
    
    map.current.addLayer({
      id: routeArrowLayerId, type: 'symbol', source: routeSourceId,
      layout: { 'symbol-placement': 'line', 'symbol-spacing': 80, 'icon-image': 'arrow-right', 'icon-size': 0.6, 'icon-allow-overlap': true, 'icon-ignore-placement': true },
    });

    if (!map.current.hasImage('arrow-right')) {
        const arrowSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const img = new Image(24, 24);
        img.onload = () => { if (map.current && !map.current.hasImage('arrow-right')) map.current.addImage('arrow-right', img); };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(arrowSvg);
    }

    if (routeOrigin) {
      const el = document.createElement('div');
      const root = createRoot(el);
      root.render(<div className="w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-md animate-pulse"></div>);
      originMarkerRef.current = new mapboxgl.Marker({ element: el }).setLngLat(routeOrigin).addTo(map.current);
    }
    
    if (!isMultiStopMode && routeDestination) {
      const el = document.createElement('div');
      const root = createRoot(el);
      root.render(<div className="flex flex-col items-center pb-2"><MapPin size={32} className="text-red-600 drop-shadow-md fill-red-600" /></div>);
      destinationMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat(routeDestination).addTo(map.current);
    }

    const coordinates = activeRouteData.geometry.coordinates as [number, number][];
    if (coordinates && coordinates.length > 0) {
        const bounds = coordinates.reduce((b, c) => b.extend(c as [number, number]), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
        map.current.fitBounds(bounds, { padding: { top: 150, bottom: 300, left: 50, right: 50 }, duration: 1000 });
    }
  }, [routeInfo, multiStopRoute, isMultiStopMode, routeOrigin, routeDestination, mapLoaded]); 

  const handleFlyToStore = (lat: number, lng: number) => {
    if (map.current) {
      if (tempMarkerRef.current) tempMarkerRef.current.remove();
      map.current.flyTo({ center: [lng, lat], zoom: 17, pitch: 50, duration: 1500 });
      
      const el = document.createElement('div');
      const root = createRoot(el);
      root.render(<MapPin size={40} className="text-red-500 fill-red-500 animate-bounce" />);
      tempMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([lng, lat]).addTo(map.current);
    }
  };

  if (!isTokenChecked) return <div className="w-full h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (!mapboxToken) return <div className="w-full h-full flex items-center justify-center p-4"><MapboxTokenPrompt onSaved={handleSaveToken} /></div>;

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {userLocation && <NearbyVoucherBanner userLocation={userLocation} onViewStore={handleFlyToStore} />}
    </div>
  );
};