import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Navigation, MapPin, Building2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { locations } from '@/data/locations';
import { supabase } from '@/integrations/supabase/client';
import { getMapboxToken } from '@/lib/mapboxToken';

// --- HÀM BỎ DẤU ---
const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
};

// --- TÍNH KHOẢNG CÁCH ---
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

interface SearchResult {
  id: string | number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  source: 'local' | 'database' | 'mapbox';
  type: string;
  originalData: any;
  distance?: number;
}

interface SearchBarProps {
  onLocationSelect: (location: any) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  userLocation?: { lat: number; lng: number } | null;
  resultContainerStyle?: React.CSSProperties;
}

export const SearchBar = ({ 
  onLocationSelect, 
  onFocus, 
  onBlur, 
  placeholder = "Tìm địa điểm...", 
  userLocation,
  resultContainerStyle 
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // State để báo lỗi nếu thiếu token
  const [tokenError, setTokenError] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  // Logic tìm kiếm
  useEffect(() => {
    if (!query) {
      setResults([]);
      setTokenError(false);
      return;
    }

    setIsOpen(true);
    setIsLoading(true);
    setTokenError(false);

    const timer = setTimeout(async () => {
      const cleanQuery = removeAccents(query).toLowerCase().trim();
      console.log("🔍 Bắt đầu tìm kiếm:", cleanQuery);

      // 1. TÌM LOCAL (Ưu tiên số 1)
      const localMatches: SearchResult[] = locations
        .filter(loc => {
          const name = removeAccents(loc.name).toLowerCase();
          const nameVi = removeAccents(loc.nameVi || '').toLowerCase();
          return name.includes(cleanQuery) || nameVi.includes(cleanQuery);
        })
        .map(loc => ({
          id: `local-${loc.id}`,
          name: loc.nameVi || loc.name,
          address: loc.address || 'Đại học Bách Khoa HN',
          lat: loc.lat,
          lng: loc.lng,
          source: 'local' as const,
          type: loc.type,
          originalData: loc,
          distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng) : 0
        }));

      // Chuẩn bị gọi API
      const mapboxToken = getMapboxToken();
      if (!mapboxToken) {
        console.warn("⚠️ Không tìm thấy Mapbox Token!");
        setTokenError(true);
      }

      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        let dbResults: SearchResult[] = [];
        let mapboxResults: SearchResult[] = [];

        // 2. TÌM DATABASE (Ưu tiên số 2)
        const { data: dbMatches } = await supabase
          .from('user_stores')
          .select('*')
          .ilike('name_vi', `%${query}%`)
          .limit(5);

        if (dbMatches) {
          dbResults = dbMatches.map(store => ({
            id: `db-${store.id}`,
            name: store.name_vi,
            address: store.address_vi,
            lat: store.lat,
            lng: store.lng,
            source: 'database' as const,
            type: store.category,
            originalData: store,
            distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng) : 0
          }));
        }

        // 3. TÌM MAPBOX (JW Marriott nằm ở đây)
        if (mapboxToken) {
          const proximity = userLocation ? `&proximity=${userLocation.lng},${userLocation.lat}` : '';
          // Tìm cả POI và Address để đảm bảo ra kết quả
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=vn&autocomplete=true&limit=10&language=vi&types=poi,address${proximity}`;
          
          console.log("🌍 Gọi Mapbox API:", url); // <--- BẠN KIỂM TRA LINK NÀY TRONG CONSOLE

          const res = await fetch(url, { signal });
          
          if (res.ok) {
            const data = await res.json();
            console.log("✅ Kết quả Mapbox:", data.features?.length || 0);
            
            if (data.features) {
              mapboxResults = data.features.map((feature: any) => ({
                id: feature.id,
                name: feature.text, // Tên địa điểm (JW Marriott...)
                address: feature.place_name?.replace(feature.text + ', ', '').replace(', Vietnam', ''),
                lat: feature.center[1],
                lng: feature.center[0],
                source: 'mapbox' as const,
                type: 'checkin', 
                originalData: {
                   id: feature.id, 
                   name: feature.text, 
                   nameVi: feature.text,
                   address: feature.place_name, 
                   lat: feature.center[1], 
                   lng: feature.center[0],
                   type: 'checkin', 
                   isMapboxResult: true
                },
                distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, feature.center[1], feature.center[0]) : 0
              }));
            }
          } else {
            console.error("❌ Lỗi Mapbox:", res.status);
          }
        }

        // 4. GỘP KẾT QUẢ (Không lọc, chỉ sắp xếp)
        const allResults = [...localMatches, ...dbResults, ...mapboxResults];
        
        // Nếu tìm thấy kết quả khớp chính xác tên, đưa lên đầu
        allResults.sort((a, b) => {
           const aExact = removeAccents(a.name).toLowerCase() === cleanQuery;
           const bExact = removeAccents(b.name).toLowerCase() === cleanQuery;
           if (aExact && !bExact) return -1;
           if (!aExact && bExact) return 1;
           // Nếu không khớp tên thì ưu tiên khoảng cách
           return (a.distance || 0) - (b.distance || 0);
        });

        setResults(allResults);

      } catch (error: any) {
        if (error.name !== 'AbortError') console.error("Lỗi tìm kiếm:", error);
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    }, 400); // Tăng thời gian chờ một chút để gõ xong hẳn mới tìm

    return () => clearTimeout(timer);
  }, [query, userLocation]);

  const handleSelect = (result: SearchResult) => {
    setQuery(result.name);
    setResults([]); 
    setIsOpen(false);
    if (inputRef.current) inputRef.current.blur();
    onLocationSelect(result.originalData);
  };

  const clearSearch = () => {
    setQuery(''); setResults([]); 
    if (inputRef.current) inputRef.current.focus();
  };

  const formatDistance = (dist?: number) => {
    if (dist === undefined) return '';
    if (dist < 1) return `${(dist * 1000).toFixed(0)}m`;
    return `${dist.toFixed(1)}km`;
  };

  return (
    <div ref={containerRef} className="relative w-full pointer-events-auto">
      {/* THANH INPUT */}
      <div className="relative flex items-center bg-white rounded-full shadow-md border border-gray-200 h-12 overflow-hidden transition-all duration-200 focus-within:shadow-lg">
        <div className="pl-4 pr-2 text-gray-400">
           {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-blue-500"/> : <Search className="w-5 h-5"/>}
        </div>

        <Input 
          ref={inputRef}
          className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-full bg-transparent text-base px-2 placeholder:text-gray-500 w-full"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          style={{ fontSize: '16px' }}
        />

        {query && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 mr-2 hover:bg-gray-100 rounded-full" 
            onMouseDown={(e) => { e.preventDefault(); clearSearch(); }}
          >
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        )}
      </div>

      {/* DROPDOWN KẾT QUẢ */}
      {isOpen && (results.length > 0 || (isLoading && query) || tokenError) && (
        <div 
          className="absolute left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100] max-h-[60vh] overflow-y-auto mt-2"
          style={resultContainerStyle || { top: '100%' }}
        >
            {/* BÁO LỖI TOKEN */}
            {tokenError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm flex items-center gap-2 border-b border-red-100">
                <AlertCircle className="w-4 h-4" />
                <span>Lỗi cấu hình: Chưa nhập Mapbox Token!</span>
              </div>
            )}

            {isLoading && results.length === 0 && !tokenError && (
                <div className="p-4 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin"/> Đang tìm...
                </div>
            )}

            <div className="py-1">
              {results.map((result) => (
                <button
                  key={`${result.source}-${result.id}`}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(result); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b last:border-0 border-gray-50 group"
                >
                  {/* ICON */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    result.source === 'local' ? 'bg-blue-100 text-blue-600' :
                    result.source === 'database' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                      {result.source === 'local' || result.source === 'database' ? <Building2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  </div>
                  
                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                            {result.name}
                        </h4>
                        
                        {userLocation && (
                            <div className="flex items-center text-[11px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                                <Navigation className="w-3 h-3 mr-0.5" />
                                {formatDistance(result.distance)}
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1">
                       {result.source === 'local' && <span className="bg-blue-100 text-blue-700 px-1 rounded text-[10px] font-bold">Nội bộ</span>}
                       {result.source === 'database' && <span className="bg-purple-100 text-purple-700 px-1 rounded text-[10px] font-bold">Đối tác</span>}
                       <span className="truncate">{result.address}</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
        </div>
      )}
      
      {/* TRẠNG THÁI KHÔNG TÌM THẤY */}
      {isOpen && !isLoading && query && results.length === 0 && !tokenError && (
          <div 
            className="absolute left-0 right-0 bg-white rounded-xl shadow-lg p-4 text-center text-gray-500 text-sm z-[100] mt-2"
            style={resultContainerStyle || { top: '100%' }}
          >
             Không tìm thấy địa điểm nào phù hợp.
          </div>
      )}
    </div>
  );
};