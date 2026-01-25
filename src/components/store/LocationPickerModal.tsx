import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, Search, X } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css'; 
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export const LocationPickerModal = ({ isOpen, onClose, onConfirm, initialLat, initialLng }: LocationPickerModalProps) => {
  const mapRef = useRef<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [viewState, setViewState] = useState({
    latitude: initialLat || 21.0285,
    longitude: initialLng || 105.8542,
    zoom: 15
  });
  const [marker, setMarker] = useState({
    lat: initialLat || 21.0285,
    lng: initialLng || 105.8542
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const lat = initialLat || 21.0285;
      const lng = initialLng || 105.8542;
      
      setMarker({ lat, lng });
      setViewState(prev => ({ ...prev, latitude: lat, longitude: lng }));
      
      if (initialLat && initialLng) {
        fetchAddressFromCoords(lat, lng);
      } else {
        setSearchQuery('');
      }
      
      setSuggestions([]);
      setTimeout(() => mapRef.current?.resize(), 200);
    }
  }, [isOpen, initialLat, initialLng]);

  // Hàm bay camera (Chỉ dùng khi tìm kiếm)
  const flyToLocation = (lat: number, lng: number) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 16,
      duration: 1500,
      essential: true
    });
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.length > 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=vn&limit=5&addressdetails=1`
          );
          const data = await res.json();
          setSuggestions(data);
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      }, 500);
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    setMarker({ lat, lng });
    flyToLocation(lat, lng); // Khi chọn từ list thì mới BAY
    
    setSearchQuery(item.display_name);
    setSuggestions([]);
  };

  // --- SỬA ĐỔI QUAN TRỌNG: KÉO THẢ MƯỢT HƠN ---
  
  // 1. Khi đang kéo (onDrag): Cập nhật vị trí ghim liên tục để nó dính vào chuột
  const handleMarkerDrag = (event: any) => {
    const { lng, lat } = event.lngLat;
    setMarker({ lat, lng });
  };

  // 2. Khi thả tay (onDragEnd): Chỉ lấy địa chỉ, KHÔNG BAY CAMERA NỮA
  const handleMarkerDragEnd = async (event: any) => {
    const { lng, lat } = event.lngLat;
    setMarker({ lat, lng });
    
    // Đã xóa dòng flyToLocation(lat, lng); -> Giúp bản đồ đứng yên, không bị giật
    await fetchAddressFromCoords(lat, lng);
  };

  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setSearchQuery(data.display_name);
      }
    } catch (error) {
      console.error("Lỗi lấy địa chỉ:", error);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleConfirm = () => {
    onConfirm(marker.lat, marker.lng, searchQuery);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0 z-[110]">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Chọn vị trí</DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative w-full h-full bg-gray-100">
          
          <div className="absolute top-4 left-4 right-14 z-20 flex flex-col gap-1">
            <div className="flex shadow-xl rounded-lg overflow-hidden bg-white ring-1 ring-gray-200">
                <Input 
                    value={searchQuery}
                    onChange={handleSearchInput}
                    placeholder="Tìm kiếm địa chỉ..."
                    className="h-11 bg-white border-0 rounded-none focus-visible:ring-0 pl-4 text-base"
                />
                <div className="flex items-center justify-center px-3 bg-white text-gray-400">
                    {isSearching || isReverseGeocoding ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary"/>
                    ) : searchQuery ? (
                        <button onClick={() => { setSearchQuery(''); setSuggestions([]); }}>
                            <X className="w-5 h-5 hover:text-red-500"/>
                        </button>
                    ) : (
                        <Search className="w-5 h-5"/>
                    )}
                </div>
            </div>

            {suggestions.length > 0 && (
                <div className="bg-white rounded-lg shadow-2xl border overflow-hidden max-h-60 overflow-y-auto mt-1 animate-in fade-in slide-in-from-top-2">
                    {suggestions.map((item, idx) => (
                        <div 
                            key={idx}
                            onClick={() => handleSelectSuggestion(item)}
                            className="p-3 text-sm hover:bg-blue-50 cursor-pointer border-b last:border-0 flex items-start gap-3 transition-colors"
                        >
                            <div className="bg-gray-100 p-1.5 rounded-full flex-shrink-0 mt-0.5">
                                <MapPin className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-900 line-clamp-1">
                                    {item.name || item.display_name.split(',')[0]}
                                </span>
                                <span className="text-xs text-gray-500 line-clamp-2">
                                    {item.display_name}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <Map
            ref={mapRef}
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          >
            <NavigationControl position="bottom-right" />
            
            <Marker
              latitude={marker.lat}
              longitude={marker.lng}
              anchor="bottom"
              draggable // Bắt buộc phải có prop này
              onDrag={handleMarkerDrag}      // Sự kiện kéo (mượt mà)
              onDragEnd={handleMarkerDragEnd} // Sự kiện thả (lấy địa chỉ)
            >
              {/* Thêm style cursor-grab để người dùng biết là kéo được */}
              <div className="relative flex flex-col items-center group cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                 <div className="absolute -top-8 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Kéo tôi
                 </div>
                 <MapPin className="w-12 h-12 text-red-600 drop-shadow-2xl fill-white" />
                 <div className="w-3 h-1 bg-black/30 rounded-full blur-[2px]" />
              </div>
            </Marker>
          </Map>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border text-xs font-medium text-gray-600 pointer-events-none flex items-center gap-2">
             {isReverseGeocoding ? (
                 <>
                    <Loader2 className="w-3 h-3 animate-spin"/> Đang lấy địa chỉ...
                 </>
             ) : (
                 "Kéo thả ghim đỏ để cập nhật địa chỉ"
             )}
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-white">
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button onClick={handleConfirm} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
            <MapPin className="w-4 h-4" /> Xác nhận vị trí này
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};