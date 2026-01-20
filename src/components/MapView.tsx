import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location, VNU_CENTER, locations, LocationType } from '@/data/locations';
import { RouteInfo } from '@/hooks/useDirections';
import { MultiStopRouteInfo, Waypoint } from '@/hooks/useMultiStopDirections';
import { BusRoute } from '@/data/busRoutes';
import { getMapboxToken } from '@/lib/mapboxToken';
import { MapboxTokenPrompt } from '@/components/map/MapboxTokenPrompt';
import { useLanguage } from '@/i18n/LanguageContext';

interface MapViewProps {
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
  activeCategories: LocationType[];
  flyToLocation?: Location | null;
  routeInfo?: RouteInfo | null;
  routeOrigin?: [number, number] | null;
  routeDestination?: [number, number] | null;
  onClearRoute?: () => void;
  // Multi-stop support
  multiStopRoute?: MultiStopRouteInfo | null;
  isMultiStopMode?: boolean;
  // Bus routes support
  selectedBusRoute?: BusRoute | null;
}

// Mapbox token is resolved at runtime (env or localStorage)

export const MapView = ({ 
  selectedLocation, 
  onSelectLocation, 
  activeCategories,
  flyToLocation,
  routeInfo,
  routeOrigin,
  routeDestination,
  onClearRoute,
  multiStopRoute,
  isMultiStopMode = false,
  selectedBusRoute,
}: MapViewProps) => {
  const { language } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const waypointMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const busStopMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxToken, setMapboxTokenState] = useState<string | null>(null);
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const routeLayerId = 'route-line';
  const routeArrowLayerId = 'route-arrows';
  const routeSourceId = 'route-source';
  const busRouteLayerId = 'bus-route-line';
  const busRouteSourceId = 'bus-route-source';

  // Load token from localStorage after mount (ensures window is available)
  useEffect(() => {
    const token = getMapboxToken();
    if (token) {
      setMapboxTokenState(token);
    }
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
    }
  };

  const getTypeColor = (type: LocationType) => {
    switch (type) {
      case 'building': return '#16a34a';
      case 'food': return '#f97316';
      case 'housing': return '#3b82f6';
      case 'job': return '#8b5cf6';
    }
  };

  // Initialize map
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

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    }), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  // Update markers when categories, locations, or language change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const filteredLocations = locations.filter(loc => 
      activeCategories.includes(loc.type)
    );

    filteredLocations.forEach((location) => {
      const el = document.createElement('div');
      el.className = 'mapbox-marker';
      
      const isSelected = selectedLocation?.id === location.id;
      const size = location.isSponsored ? 48 : 40;
      
      // Get localized name
      const locationName = language === 'en' && location.name ? location.name : location.nameVi;
      
      el.innerHTML = `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${getTypeColor(location.type)};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${location.isSponsored ? '20px' : '16px'};
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: ${isSelected ? '3px solid white' : '2px solid white'};
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          transition: transform 0.2s;
          cursor: pointer;
          ${location.isSponsored ? 'animation: pulse 2s infinite;' : ''}
        ">
          ${getTypeEmoji(location.type)}
          ${location.hasVoucher ? '<span style="position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; background: #facc15; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px;">✨</span>' : ''}
        </div>
        ${location.type === 'building' ? `
          <div style="
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            white-space: nowrap;
            margin-top: 4px;
          ">${locationName}</div>
        ` : ''}
      `;

      el.addEventListener('click', () => {
        onSelectLocation(location);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([location.lng, location.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [activeCategories, mapLoaded, selectedLocation, onSelectLocation, language]);

  // Fly to location
  useEffect(() => {
    if (!map.current || !flyToLocation) return;

    map.current.flyTo({
      center: [flyToLocation.lng, flyToLocation.lat],
      zoom: 18,
      pitch: 60,
      duration: 1500,
    });
  }, [flyToLocation]);

  // Draw route on map with origin/destination markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing route layers
    if (map.current.getLayer(routeArrowLayerId)) {
      map.current.removeLayer(routeArrowLayerId);
    }
    if (map.current.getLayer(routeLayerId)) {
      map.current.removeLayer(routeLayerId);
    }
    if (map.current.getSource(routeSourceId)) {
      map.current.removeSource(routeSourceId);
    }

    // Remove existing markers
    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }

    if (!routeInfo?.geometry) return;

    // Add route source
    map.current.addSource(routeSourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: routeInfo.geometry,
      },
    });

    // Add route layer
    map.current.addLayer({
      id: routeLayerId,
      type: 'line',
      source: routeSourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 6,
        'line-opacity': 0.8,
      },
    });

    // Add arrow symbols along the route
    map.current.addLayer({
      id: routeArrowLayerId,
      type: 'symbol',
      source: routeSourceId,
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 80,
        'icon-image': 'arrow-right',
        'icon-size': 0.6,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });

    // Load arrow icon if not already loaded
    if (!map.current.hasImage('arrow-right')) {
      const arrowSvg = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      const img = new Image(24, 24);
      img.onload = () => {
        if (map.current && !map.current.hasImage('arrow-right')) {
          map.current.addImage('arrow-right', img);
        }
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(arrowSvg);
    }

    // Add origin marker (green - your location)
    if (routeOrigin) {
      const originEl = document.createElement('div');
      originEl.innerHTML = `
        <div style="
          width: 24px;
          height: 24px;
          background: #22c55e;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
      `;
      originMarkerRef.current = new mapboxgl.Marker({ element: originEl })
        .setLngLat(routeOrigin)
        .addTo(map.current);
    }

    // Add destination marker (red - target)
    if (routeDestination) {
      const destEl = document.createElement('div');
      destEl.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          background: #ef4444;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
        </div>
      `;
      destinationMarkerRef.current = new mapboxgl.Marker({ element: destEl })
        .setLngLat(routeDestination)
        .addTo(map.current);
    }

    // Fit map to route bounds
    const coordinates = routeInfo.geometry.coordinates as [number, number][];
    const bounds = coordinates.reduce(
      (bounds, coord) => bounds.extend(coord as [number, number]),
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
    );

    map.current.fitBounds(bounds, {
      padding: { top: 150, bottom: 300, left: 50, right: 50 },
      duration: 1000,
    });
  }, [routeInfo, routeOrigin, routeDestination, mapLoaded]);

  // Draw multi-stop waypoints on map
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing waypoint markers
    waypointMarkersRef.current.forEach(marker => marker.remove());
    waypointMarkersRef.current = [];

    // Also clear origin/destination markers when in multi-stop mode
    if (isMultiStopMode) {
      if (originMarkerRef.current) {
        originMarkerRef.current.remove();
        originMarkerRef.current = null;
      }
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.remove();
        destinationMarkerRef.current = null;
      }
    }

    if (!multiStopRoute?.waypoints || multiStopRoute.waypoints.length === 0) return;

    // Draw multi-stop route
    if (multiStopRoute.geometry) {
      // Remove existing route layers first
      if (map.current.getLayer(routeArrowLayerId)) {
        map.current.removeLayer(routeArrowLayerId);
      }
      if (map.current.getLayer(routeLayerId)) {
        map.current.removeLayer(routeLayerId);
      }
      if (map.current.getSource(routeSourceId)) {
        map.current.removeSource(routeSourceId);
      }

      // Add route source
      map.current.addSource(routeSourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: multiStopRoute.geometry,
        },
      });

      // Add route layer with gradient-like effect
      map.current.addLayer({
        id: routeLayerId,
        type: 'line',
        source: routeSourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#8b5cf6', // Purple for multi-stop
          'line-width': 6,
          'line-opacity': 0.85,
        },
      });

      // Add arrow symbols
      map.current.addLayer({
        id: routeArrowLayerId,
        type: 'symbol',
        source: routeSourceId,
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 80,
          'icon-image': 'arrow-right',
          'icon-size': 0.6,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
    }

    // Color palette for waypoints
    const waypointColors = [
      '#22c55e', // green - origin
      '#3b82f6', // blue
      '#f59e0b', // amber
      '#ec4899', // pink
      '#14b8a6', // teal
      '#8b5cf6', // purple
      '#ef4444', // red - destination
    ];

    // Add markers for each waypoint
    multiStopRoute.waypoints.forEach((waypoint, index) => {
      const isFirst = index === 0;
      const isLast = index === multiStopRoute.waypoints.length - 1;
      
      // Determine color
      let color = waypointColors[Math.min(index, waypointColors.length - 2)];
      if (isLast) color = '#ef4444'; // Red for final destination
      if (isFirst) color = '#22c55e'; // Green for origin

      const el = document.createElement('div');
      el.className = 'waypoint-marker';
      
      if (isFirst) {
        // Origin marker - pulsing circle
        el.innerHTML = `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
          ">
            <div style="
              position: absolute;
              inset: 0;
              background: ${color};
              border-radius: 50%;
              opacity: 0.3;
              animation: waypointPulse 2s ease-in-out infinite;
            "></div>
            <div style="
              position: absolute;
              inset: 4px;
              background: ${color};
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
            </div>
          </div>
        `;
      } else if (isLast) {
        // Destination marker - flag shape
        el.innerHTML = `
          <div style="
            width: 36px;
            height: 36px;
            background: ${color};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(239,68,68,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 14px;
              font-weight: bold;
              color: white;
            ">🏁</span>
          </div>
        `;
      } else {
        // Intermediate waypoints - numbered circles
        el.innerHTML = `
          <div style="
            width: 32px;
            height: 32px;
            background: ${color};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            color: white;
          ">
            ${index}
          </div>
          <div style="
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            white-space: nowrap;
            margin-top: 4px;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${waypoint.name}</div>
        `;
      }

      const marker = new mapboxgl.Marker({ element: el, anchor: isLast ? 'bottom' : 'center' })
        .setLngLat(waypoint.coordinates)
        .addTo(map.current!);

      waypointMarkersRef.current.push(marker);
    });

    // Fit map to show all waypoints
    if (multiStopRoute.geometry) {
      const coordinates = multiStopRoute.geometry.coordinates as [number, number][];
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord as [number, number]),
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );

      map.current.fitBounds(bounds, {
        padding: { top: 200, bottom: 350, left: 50, right: 50 },
        duration: 1000,
      });
    }
  }, [multiStopRoute, isMultiStopMode, mapLoaded]);

  // Display selected bus route on map
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear previous bus route
    busStopMarkersRef.current.forEach(m => m.remove());
    busStopMarkersRef.current = [];
    if (map.current.getLayer(busRouteLayerId)) map.current.removeLayer(busRouteLayerId);
    if (map.current.getSource(busRouteSourceId)) map.current.removeSource(busRouteSourceId);

    if (!selectedBusRoute) return;

    // Create line from stops
    const coordinates = selectedBusRoute.stops.map(s => s.coordinates);
    
    map.current.addSource(busRouteSourceId, {
      type: 'geojson',
      data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } }
    });

    map.current.addLayer({
      id: busRouteLayerId,
      type: 'line',
      source: busRouteSourceId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': selectedBusRoute.color,
        'line-width': 5,
        'line-opacity': 0.8,
        'line-dasharray': [2, 1]
      }
    });

    // Add bus stop markers
    selectedBusRoute.stops.forEach((stop, idx) => {
      const el = document.createElement('div');
      el.className = 'bus-stop-marker';
      const isTerminal = idx === 0 || idx === selectedBusRoute.stops.length - 1;
      el.innerHTML = `
        <div style="
          width: ${isTerminal ? '24px' : '18px'}; height: ${isTerminal ? '24px' : '18px'};
          background: ${isTerminal ? selectedBusRoute.color : 'white'};
          border: 3px solid ${selectedBusRoute.color};
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: bold; color: ${isTerminal ? 'white' : selectedBusRoute.color};
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">${isTerminal ? (idx === 0 ? '●' : '◆') : idx}</div>
      `;
      
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(stop.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(`
          <div style="padding:4px;font-size:12px;"><strong>${language === 'vi' ? stop.name : stop.nameEn}</strong></div>
        `))
        .addTo(map.current!);
      busStopMarkersRef.current.push(marker);
    });

    // Fit bounds to show all stops
    const bounds = new mapboxgl.LngLatBounds();
    coordinates.forEach(c => bounds.extend(c as [number, number]));
    map.current.fitBounds(bounds, { padding: 80 });
  }, [selectedBusRoute, mapLoaded, language]);

  // Add pulse animation style
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        50% { box-shadow: 0 4px 20px rgba(249, 115, 22, 0.6); }
      }
      @keyframes waypointPulse {
        0%, 100% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Show loading state while checking token
  if (!isTokenChecked) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center p-4">
        <MapboxTokenPrompt onSaved={handleSaveToken} />
      </div>
    );
  }

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
};
