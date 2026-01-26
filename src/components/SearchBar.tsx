import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Store, Globe, X, Navigation, Coffee, Utensils, GraduationCap, Building, Home, Briefcase, Car, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { locations } from '@/data/locations';
import { supabase } from '@/integrations/supabase/client';
import { getMapboxToken } from '@/lib/mapboxToken';

// Hàm bỏ dấu (Clean text)
const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
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

// 1. TỪ ĐIỂN Ý ĐỊNH (User gõ -> Hệ thống hiểu loại gì)
const KEYWORD_MAPPING: Record<string, string> = {
  // Food
  'an': 'food', 'doi': 'food', 'com': 'food', 'pho': 'food', 'bun': 'food', 'mi': 'food', 'banh': 'food',
  // Cafe
  'uong': 'cafe', 'khat': 'cafe', 'nuoc': 'cafe', 'cf': 'cafe', 'cafe': 'cafe', 'coffee': 'cafe', 'tra': 'cafe',
  // Housing
  'ngu': 'housing', 'tro': 'housing', 'ktx': 'housing', 'hotel': 'housing', 'nha nghi': 'housing',
  // Study
  'hoc': 'lecture_hall', 'giang duong': 'lecture_hall', 'thu vien': 'library',
  // Utility
  'xe': 'parking', 'gui': 'parking', 'do': 'parking',
  'wc': 'wc', 've sinh': 'wc',
  'tien': 'bank', 'atm': 'bank', 'bank': 'bank',
  'viec': 'job', 'lam': 'job'
};

// 2. TỪ KHÓA MAPBOX (Hệ thống hiểu loại gì -> Gửi từ này cho Mapbox)
// Đây là fix cho lỗi "Khát không ra gì": Gõ khát -> cafe -> Gửi "coffee" cho Mapbox
const MAPBOX_QUERIES: Record<string, string> = {
  'food': 'restaurant quán ăn',
  'cafe': 'coffee cafe',
  'housing': 'hotel hostel nhà nghỉ',
  'lecture_hall': 'university school',
  'parking': 'parking',
  'wc': 'toilet',
  'bank': 'atm bank',
  'job': 'office company',
  'sport': 'stadium gym'
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

export const SearchBar = ({ 
  onLocationSelect, 
  onFocus, 
  onBlur, 
  placeholder = "Tìm: Đói, Khát, C1, ATM...", 
  userLocation,
  resultContainerStyle 
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  useEffect(() => {
    if (!query) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setIsLoading(true);

    const timer = setTimeout(async () => {
      // 1. CHUẨN HÓA INPUT
      const cleanQuery = removeAccents(query).toLowerCase().trim();
      
      // 2. PHÁT HIỆN Ý ĐỊNH (INTENT DETECTION)
      let detectedCategory: string | null = null;
      
      // Tìm xem query có chứa từ khóa nào không (VD: "dang doi bung" -> chứa "doi" -> food)
      for (const key in KEYWORD_MAPPING) {
        if (cleanQuery.includes(key)) {
          detectedCategory = KEYWORD_MAPPING[key];
          break; // Tìm thấy 1 cái là chốt luôn (Ưu tiên từ đầu tiên khớp)
        }
      }

      // 3. TÌM LOCAL (CHẾ ĐỘ NGHIÊM NGẶT)
      const localMatches: SearchResult[] = locations
        .filter(loc => {
          if (detectedCategory) {
            // STRICT MODE: Nếu đã hiểu ý định -> CHỈ trả về đúng loại đó.
            // Tuyệt đối không tìm theo tên để tránh "rác".
            return loc.type === detectedCategory;
          } else {
            // NORMAL MODE: Nếu không hiểu ý định (VD: gõ "C1", "Tạ Quang Bửu") -> Tìm theo tên
            const name = removeAccents(loc.name).toLowerCase();
            const nameVi = removeAccents(loc.nameVi || '').toLowerCase();
            return name.includes(cleanQuery) || nameVi.includes(cleanQuery);
          }
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

      // 4. TÌM API (SUPABASE & MAPBOX)
      const mapboxToken = getMapboxToken();
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        let dbResults: SearchResult[] = [];
        let mapboxResults: SearchResult[] = [];

        // A. Tìm Supabase
        // Nếu có category -> tìm theo category trong DB luôn cho chuẩn
        let dbQuery = supabase.from('user_stores').select('*');
        if (detectedCategory) {
           dbQuery = dbQuery.eq('category', detectedCategory);
        } else {
           dbQuery = dbQuery.ilike('name_vi', `%${query}%`);
        }
        const { data: dbMatches } = await dbQuery.limit(5);

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

        // B. Tìm Mapbox (Chìa khóa cho vấn đề "Khát")
        if (mapboxToken) {
          const proximity = userLocation ? `&proximity=${userLocation.lng},${userLocation.lat}` : '';
          
          // QUAN TRỌNG: Chọn từ khóa để gửi cho Mapbox
          // Nếu hiểu ý định (detectedCategory = 'cafe') -> Gửi "coffee cafe"
          // Nếu không -> Gửi nguyên văn user nhập
          let finalQuery = query;
          if (detectedCategory && MAPBOX_QUERIES[detectedCategory]) {
            finalQuery = MAPBOX_QUERIES[detectedCategory];
          }

          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(finalQuery)}.json?access_token=${mapboxToken}&country=vn&autocomplete=true&limit=8&language=vi&types=poi,address${proximity}`,
            { signal }
          );
          const data = await res.json();
          
          if (data.features) {
            mapboxResults = data.features.map((feature: any) => ({
              id: feature.id,
              name: feature.text,
              address: feature.place_name,
              lat: feature.center[1],
              lng: feature.center[0],
              source: 'mapbox' as const,
              // Gán type chuẩn nếu đã detect được, để hiện icon đúng
              type: detectedCategory || feature.properties.category || 'place',
              originalData: {
                 id: feature.id, name: feature.text, nameVi: feature.text,
                 address: feature.place_name, lat: feature.center[1], lng: feature.center[0],
                 type: detectedCategory || 'checkin', 
                 isMapboxResult: true
              },
              distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, feature.center[1], feature.center[0]) : 0
            }));
          }
        }

        // 5. GỘP KẾT QUẢ
        const allResults = [...localMatches, ...dbResults, ...mapboxResults];
        
        // Sắp xếp: Ưu tiên khoảng cách gần nhất
        if (userLocation) {
          allResults.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        setResults(allResults);
      } catch (error: any) {
        if (error.name !== 'AbortError') console.error("Search Error:", error);
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [query, userLocation]);

  const handleSelect = (result: SearchResult) => {
    setQuery(''); setResults([]); setIsOpen(false);
    if (inputRef.current) inputRef.current.blur();
    onLocationSelect(result.originalData);
  };

  const clearSearch = () => {
    setQuery(''); setResults([]); setIsOpen(false);
    if (onBlur) onBlur();
  };

  const formatDistance = (dist?: number) => {
    if (dist === undefined) return '';
    if (dist < 1) return `${(dist * 1000).toFixed(0)}m`;
    return `${dist.toFixed(1)}km`;
  };

  // Helper Icon
  const getIcon = (type: string) => {
      const t = (type || '').toLowerCase();
      if (t.includes('food')) return <Utensils className="w-4 h-4 text-white" />;
      if (t.includes('cafe') || t.includes('coffee')) return <Coffee className="w-4 h-4 text-white" />;
      if (t.includes('lecture') || t.includes('school')) return <GraduationCap className="w-4 h-4 text-white" />;
      if (t.includes('housing') || t.includes('hotel')) return <Home className="w-4 h-4 text-white" />;
      if (t.includes('job') || t.includes('office')) return <Briefcase className="w-4 h-4 text-white" />;
      if (t.includes('bank') || t.includes('atm')) return <DollarSign className="w-4 h-4 text-white" />;
      if (t.includes('parking')) return <Car className="w-4 h-4 text-white" />;
      return <Globe className="w-4 h-4 text-white" />;
  };

  const getIconBg = (type: string, source: string) => {
      const t = (type || '').toLowerCase();
      if (t.includes('food')) return 'bg-orange-500';
      if (t.includes('cafe')) return 'bg-amber-600';
      if (t.includes('lecture')) return 'bg-blue-600';
      if (t.includes('housing')) return 'bg-indigo-500';
      if (t.includes('bank')) return 'bg-emerald-600';
      
      if (source === 'local') return 'bg-blue-500'; 
      if (source === 'database') return 'bg-green-600';
      return 'bg-gray-400';
  };

  return (
    <div ref={containerRef} className="relative w-full pointer-events-auto">
      <div className="relative flex items-center bg-white rounded-xl shadow-lg border border-gray-200 h-11 overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/20">
        <Search className="ml-3 h-5 w-5 text-gray-400 shrink-0" />
        <Input 
          ref={inputRef}
          className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-full bg-transparent text-base px-3 placeholder:text-gray-400 w-full"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { 
            if (onFocus) onFocus();
            if (results.length > 0 || query.length > 0) setIsOpen(true);
          }}
          style={{ fontSize: '16px' }}
        />
        {isLoading ? (
          <Loader2 className="mr-3 h-5 w-5 animate-spin text-blue-500 shrink-0" />
        ) : query && (
          <Button variant="ghost" size="icon" className="h-8 w-8 mr-2 hover:bg-gray-100 rounded-full" onClick={clearSearch}>
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        )}
      </div>

      {isOpen && (results.length > 0 || isLoading) && (
        <div 
          className="absolute left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100] max-h-[60vh] overflow-y-auto"
          style={resultContainerStyle || { top: '100%', marginTop: '8px' }}
        >
            {isLoading && results.length === 0 && (
                <div className="p-4 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin"/> Đang tìm quanh đây...
                </div>
            )}

            <div className="py-1">
              {results.map((result) => (
                <button
                  key={`${result.source}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b last:border-0 border-gray-50 group"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(result.type, result.source)}`}>
                      {getIcon(result.type)}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                            {result.name}
                        </h4>
                        
                        {userLocation && (
                            <div className="flex items-center text-[11px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                                <Navigation className="w-3 h-3 mr-0.5" />
                                {formatDistance(result.distance)}
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{result.address}</p>
                  </div>
                </button>
              ))}
            </div>
        </div>
      )}
      
      {isOpen && !isLoading && query && results.length === 0 && (
          <div 
            className="absolute left-0 right-0 bg-white rounded-xl shadow-lg p-4 text-center text-gray-500 text-sm z-[100]"
            style={resultContainerStyle || { top: '100%', marginTop: '8px' }}
          >
             Không tìm thấy địa điểm nào.
          </div>
      )}
    </div>
  );
};