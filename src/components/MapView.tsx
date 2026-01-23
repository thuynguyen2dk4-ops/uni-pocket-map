// src/components/MapView.tsx
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location, VNU_CENTER, locations, LocationType } from '@/data/locations';
import { RouteInfo } from '@/hooks/useDirections'; // Import type
import { MultiStopRouteInfo } from '@/hooks/useMultiStopDirections'; // Import type
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
  routeInfo: RouteInfo | null; // Fix type any
  multiStopRoute: MultiStopRouteInfo | null; // Fix type any
  isMultiStopMode: boolean;
}

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
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const waypointMarkersRef = useRef<mapboxgl.Marker[]>([]);
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

  const getTypeEmoji = (type: LocationType) => {
    switch (type) {
      case 'building': return '🏢';
      case 'food': return '☕';
      case 'housing': return '🏠';
      case 'job': return '💼';
      default: return '📍';
    }
  };

  const getTypeColor = (type: LocationType) => {
    switch (type) {
      case 'building': return '#16a34a';
      case 'food': return '#f97316';
      case 'housing': return '#3b82f6';
      case 'job': return '#8b5cf6';
      default: return '#64748b';
    }
  };

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

    // Chỉ cập nhật state nội bộ để hiện Banner Voucher. 
    // KHÔNG gọi onUserLocationUpdate ở đây nữa để tránh Conflict với Index.tsx
    geolocateControl.on('geolocate', (e: any) => {
      const coords = { lat: e.coords.latitude, lng: e.coords.longitude };
      setUserLocation(coords); 
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

  // Logic vẽ Marker (Giữ nguyên logic cũ nhưng code sạch hơn)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const allLocations = [...locations, ...storesAsLocations];
    const filteredLocations = allLocations.filter(loc => activeCategories.includes(loc.type));

    filteredLocations.forEach((location) => {
      const el = document.createElement('div');
      el.className = 'mapbox-marker';
      
      const isSelected = selectedLocation?.id === location.id;
      const size = location.isSponsored ? 48 : 40;
      const locationName = language === 'en' && location.name ? location.name : location.nameVi;
      
      el.innerHTML = `
        <div style="
          width: ${size}px; height: ${size}px; background: ${getTypeColor(location.type)};
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: ${location.isSponsored ? '20px' : '16px'};
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: ${isSelected ? '3px solid white' : '2px solid white'};
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          transition: transform 0.2s; cursor: pointer;
          ${location.isSponsored ? 'animation: pulse 2s infinite;' : ''}
        ">
          ${getTypeEmoji(location.type)}
          ${location.hasVoucher ? '<span style="position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; background: #facc15; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px;">✨</span>' : ''}
        </div>
        ${location.type === 'building' ? `
          <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; white-space: nowrap; margin-top: 4px;">${locationName}</div>
        ` : ''}
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectLocation(location);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([location.lng, location.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [activeCategories, mapLoaded, selectedLocation, onSelectLocation, language, storesAsLocations]);

  // FlyTo Logic
  useEffect(() => {
    if (!map.current || !flyToLocation) return;
    map.current.flyTo({
      center: [flyToLocation.lng, flyToLocation.lat],
      zoom: 18,
      pitch: 60,
      duration: 1500,
    });
  }, [flyToLocation]);

  // Route Drawing Logic (Single)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    // ... Clear cũ ...
    if (map.current.getLayer(routeArrowLayerId)) map.current.removeLayer(routeArrowLayerId);
    if (map.current.getLayer(routeLayerId)) map.current.removeLayer(routeLayerId);
    if (map.current.getSource(routeSourceId)) map.current.removeSource(routeSourceId);
    if (originMarkerRef.current) { originMarkerRef.current.remove(); originMarkerRef.current = null; }
    if (destinationMarkerRef.current) { destinationMarkerRef.current.remove(); destinationMarkerRef.current = null; }

    if (!routeInfo?.geometry) return;

    map.current.addSource(routeSourceId, {
      type: 'geojson',
      data: { type: 'Feature', properties: {}, geometry: routeInfo.geometry },
    });
    map.current.addLayer({
      id: routeLayerId, type: 'line', source: routeSourceId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#3b82f6', 'line-width': 6, 'line-opacity': 0.8 },
    });
    map.current.addLayer({
      id: routeArrowLayerId, type: 'symbol', source: routeSourceId,
      layout: { 'symbol-placement': 'line', 'symbol-spacing': 80, 'icon-image': 'arrow-right', 'icon-size': 0.6, 'icon-allow-overlap': true, 'icon-ignore-placement': true },
    });

    // Load arrow image if needed
    if (!map.current.hasImage('arrow-right')) {
        const arrowSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const img = new Image(24, 24);
        img.onload = () => { if (map.current && !map.current.hasImage('arrow-right')) map.current.addImage('arrow-right', img); };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(arrowSvg);
    }

    if (routeOrigin) {
      const originEl = document.createElement('div');
      originEl.innerHTML = `<div style="width: 24px; height: 24px; background: #22c55e; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`;
      originMarkerRef.current = new mapboxgl.Marker({ element: originEl }).setLngLat(routeOrigin).addTo(map.current);
    }
    if (routeDestination) {
      const destEl = document.createElement('div');
      destEl.innerHTML = `<div style="width: 32px; height: 32px; background: #ef4444; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div></div>`;
      destinationMarkerRef.current = new mapboxgl.Marker({ element: destEl }).setLngLat(routeDestination).addTo(map.current);
    }

    // Fit bounds
    const coordinates = routeInfo.geometry.coordinates as [number, number][];
    const bounds = coordinates.reduce((b, c) => b.extend(c as [number, number]), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    map.current.fitBounds(bounds, { padding: { top: 150, bottom: 300, left: 50, right: 50 }, duration: 1000 });
  }, [routeInfo, routeOrigin, routeDestination, mapLoaded]);

  // Logic Multi-Stop (Giữ nguyên hoặc cập nhật tương tự)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    waypointMarkersRef.current.forEach(marker => marker.remove());
    waypointMarkersRef.current = [];

    if (isMultiStopMode && multiStopRoute?.geometry) {
       // Code vẽ route multi-stop (giữ nguyên logic cũ của bạn ở đây)
       // Lưu ý: Đảm bảo multiStopRoute không null trước khi truy cập
       if (map.current.getSource(routeSourceId)) {
          (map.current.getSource(routeSourceId) as mapboxgl.GeoJSONSource).setData({
             type: 'Feature', properties: {}, geometry: multiStopRoute.geometry
          });
       } else {
          // Add source/layer giống logic Single nếu chưa có
          map.current.addSource(routeSourceId, { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: multiStopRoute.geometry }});
          map.current.addLayer({ id: routeLayerId, type: 'line', source: routeSourceId, layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#8b5cf6', 'line-width': 6, 'line-opacity': 0.8 }});
          map.current.addLayer({ id: routeArrowLayerId, type: 'symbol', source: routeSourceId, layout: { 'symbol-placement': 'line', 'symbol-spacing': 80, 'icon-image': 'arrow-right', 'icon-size': 0.6 }});
       }
       
       // Fit bounds multi stop
       const coordinates = multiStopRoute.geometry.coordinates as [number, number][];
       const bounds = coordinates.reduce((b, c) => b.extend(c as [number, number]), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
       map.current.fitBounds(bounds, { padding: { top: 150, bottom: 300, left: 50, right: 50 }, duration: 1000 });
    }
  }, [multiStopRoute, isMultiStopMode, mapLoaded]);

  const handleFlyToStore = (lat: number, lng: number) => {
    if (map.current) {
      if (tempMarkerRef.current) tempMarkerRef.current.remove();
      map.current.flyTo({ center: [lng, lat], zoom: 17, pitch: 50, duration: 1500 });
      tempMarkerRef.current = new mapboxgl.Marker({ color: '#ef4444' }).setLngLat([lng, lat]).addTo(map.current);
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