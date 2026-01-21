import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Check, Search } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/i18n/LanguageContext';
import { getMapboxToken } from '@/lib/mapboxToken';
import { VNU_CENTER } from '@/data/locations';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export const LocationPickerModal = ({ 
  isOpen, 
  onClose, 
  onSelect,
  initialLat,
  initialLng 
}: LocationPickerModalProps) => {
  const { language } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  
  const [selectedLat, setSelectedLat] = useState(initialLat || VNU_CENTER.lat);
  const [selectedLng, setSelectedLng] = useState(initialLng || VNU_CENTER.lng);
  const [address, setAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mapboxToken = getMapboxToken();

  // Initialize map
  useEffect(() => {
    if (!isOpen || !mapContainer.current || map.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [selectedLng, selectedLat],
      zoom: 16,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
    }), 'top-right');

    // Add initial marker
    const el = createMarkerElement();
    markerRef.current = new mapboxgl.Marker({ element: el, draggable: true })
      .setLngLat([selectedLng, selectedLat])
      .addTo(map.current);

    // Handle marker drag
    markerRef.current.on('dragend', () => {
      const lngLat = markerRef.current?.getLngLat();
      if (lngLat) {
        setSelectedLat(lngLat.lat);
        setSelectedLng(lngLat.lng);
        reverseGeocode(lngLat.lat, lngLat.lng);
      }
    });

    // Handle map click
    map.current.on('click', (e) => {
      const { lat, lng } = e.lngLat;
      setSelectedLat(lat);
      setSelectedLng(lng);
      markerRef.current?.setLngLat([lng, lat]);
      reverseGeocode(lat, lng);
    });

    // Initial reverse geocode
    reverseGeocode(selectedLat, selectedLng);

    return () => {
      markerRef.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, [isOpen, mapboxToken]);

  const createMarkerElement = () => {
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        background: #ef4444;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `;
    return el;
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!mapboxToken) return;
    
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&language=${language}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        setAddress(data.features[0].place_name);
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapboxToken) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxToken}&proximity=${VNU_CENTER.lng},${VNU_CENTER.lat}&language=${language}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setSelectedLat(lat);
        setSelectedLng(lng);
        setAddress(data.features[0].place_name);
        
        markerRef.current?.setLngLat([lng, lat]);
        map.current?.flyTo({ center: [lng, lat], zoom: 17 });
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedLat, selectedLng, address);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {language === 'vi' ? 'Chọn vị trí' : 'Select Location'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'vi' ? 'Tìm kiếm địa điểm...' : 'Search location...'}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} size="icon" variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Map */}
        <div ref={mapContainer} className="flex-1" />

        {/* Footer with selected location */}
        <div className="p-4 border-t bg-muted/30">
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">
              {language === 'vi' ? 'Vị trí đã chọn:' : 'Selected location:'}
            </p>
            <p className="text-sm font-medium line-clamp-2">
              {isGeocoding ? (language === 'vi' ? 'Đang tải...' : 'Loading...') : (address || `${selectedLat.toFixed(6)}, ${selectedLng.toFixed(6)}`)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Lat: {selectedLat.toFixed(6)}, Lng: {selectedLng.toFixed(6)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              {language === 'vi' ? 'Xác nhận' : 'Confirm'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
