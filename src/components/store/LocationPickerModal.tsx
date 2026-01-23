import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getMapboxToken } from '@/lib/mapboxToken';
import { Loader2, MapPin } from 'lucide-react';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number, address?: string) => void;
  initialLat: number;
  initialLng: number;
}

export const LocationPickerModal = ({ 
  isOpen, onClose, onConfirm, initialLat, initialLng 
}: LocationPickerModalProps) => {
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  const [selectedCoords, setSelectedCoords] = useState({ lat: initialLat, lng: initialLng });
  const [address, setAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  useEffect(() => {
    // Chỉ khởi tạo map khi Modal mở ra
    if (!isOpen) return;

    // Timeout nhỏ để đảm bảo Dialog đã render xong DOM thì Mapbox mới gắn vào
    const timer = setTimeout(() => {
        if (!mapContainer.current) return;
        const token = getMapboxToken();
        if (!token) return;

        mapboxgl.accessToken = token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [initialLng, initialLat],
            zoom: 15,
        });

        marker.current = new mapboxgl.Marker({ color: 'red', draggable: true })
            .setLngLat([initialLng, initialLat])
            .addTo(map.current);

        marker.current.on('dragend', () => {
            const lngLat = marker.current?.getLngLat();
            if (lngLat) handleSelectLocation(lngLat.lat, lngLat.lng);
        });

        map.current.on('click', (e) => {
            handleSelectLocation(e.lngLat.lat, e.lngLat.lng);
        });
        
        // Resize lại map ngay khi load xong để tránh lỗi hiển thị xám
        map.current.resize();
    }, 100);

    return () => {
        clearTimeout(timer);
        map.current?.remove();
    };
  }, [isOpen]); // Phụ thuộc vào isOpen

  const handleSelectLocation = async (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    marker.current?.setLngLat([lng, lat]);

    setIsLoadingAddress(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        const shortAddr = data.display_name.split(',').slice(0, 3).join(',');
        setAddress(shortAddr);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedCoords.lat, selectedCoords.lng, address);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* QUAN TRỌNG: Thêm z-[200] để nó cao hơn cái Form cửa hàng (đang là z-100) 
         Thêm pointer-events-auto để chắc chắn nhận được click chuột
      */}
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0 bg-white z-[200] pointer-events-auto">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Chọn vị trí chính xác</DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative bg-gray-100 w-full min-h-0">
          {/* Container cho Mapbox */}
          <div ref={mapContainer} className="w-full h-full absolute inset-0" />
          
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-sm font-medium z-10 border pointer-events-none">
            Click hoặc kéo thả ghim đỏ để chọn vị trí
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-white flex justify-between items-center sm:justify-between z-20">
          <div className="text-sm text-gray-600 flex-1 mr-4">
             <p className="font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500"/>
                {isLoadingAddress ? "Đang tìm tên đường..." : (address || "Chưa có địa chỉ")}
             </p>
             <p className="text-xs mt-1 font-mono text-gray-400">
                {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}
             </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Hủy</Button>
            <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg">
              Xác nhận vị trí này
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};