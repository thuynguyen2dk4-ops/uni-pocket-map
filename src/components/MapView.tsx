import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location, VNU_CENTER, locations, LocationType } from '@/data/locations';
import { RouteInfo } from '@/hooks/useDirections';

interface MapViewProps {
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
  activeCategories: LocationType[];
  flyToLocation?: Location | null;
  routeInfo?: RouteInfo | null;
  onClearRoute?: () => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const MapView = ({ 
  selectedLocation, 
  onSelectLocation, 
  activeCategories,
  flyToLocation,
  routeInfo,
  onClearRoute,
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const routeLayerId = 'route-line';
  const routeSourceId = 'route-source';

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
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

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
  }, []);

  // Update markers when categories or locations change
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
          ">${location.name}</div>
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
  }, [activeCategories, mapLoaded, selectedLocation, onSelectLocation]);

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

  // Draw route on map
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing route
    if (map.current.getLayer(routeLayerId)) {
      map.current.removeLayer(routeLayerId);
    }
    if (map.current.getSource(routeSourceId)) {
      map.current.removeSource(routeSourceId);
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
  }, [routeInfo, mapLoaded]);

  // Add pulse animation style
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        50% { box-shadow: 0 4px 20px rgba(249, 115, 22, 0.6); }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-muted-foreground">Mapbox Token chưa được cấu hình</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
};
