import { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Building2, Coffee, Home, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchLocations, findDepartment, Location, Department } from '@/data/locations';

interface SearchBarProps {
  onSelectLocation: (location: Location, department?: Department) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'building': return Building2;
    case 'food': return Coffee;
    case 'housing': return Home;
    case 'job': return Briefcase;
    default: return MapPin;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'building': return 'text-primary';
    case 'food': return 'text-accent';
    case 'housing': return 'text-uni-blue';
    case 'job': return 'text-uni-purple';
    default: return 'text-muted-foreground';
  }
};

export const SearchBar = ({ onSelectLocation, onFocus, onBlur }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<Location[]>([]);
  const [departmentResult, setDepartmentResult] = useState<{ location: Location; department: Department } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim()) {
      const locations = searchLocations(query);
      setResults(locations);
      
      const deptResult = findDepartment(query);
      setDepartmentResult(deptResult);
    } else {
      setResults([]);
      setDepartmentResult(null);
    }
  }, [query]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      onBlur?.();
    }, 200);
  };

  const handleSelect = (location: Location, department?: Department) => {
    onSelectLocation(location, department);
    setQuery('');
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const showResults = isFocused && query.trim() && (results.length > 0 || departmentResult);

  return (
    <div className="relative w-full">
      <motion.div 
        className="search-bar flex items-center gap-3"
        animate={{ 
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Tìm phòng ban, tòa nhà, hoặc quán ngon..."
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-50 max-h-80 overflow-y-auto"
          >
            {/* Department result - highlighted */}
            {departmentResult && (
              <button
                onClick={() => handleSelect(departmentResult.location, departmentResult.department)}
                className="w-full p-4 flex items-start gap-3 hover:bg-secondary/50 transition-colors border-b border-border bg-secondary/30"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">
                    {departmentResult.department.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {departmentResult.location.nameVi} • {departmentResult.department.floor}
                    {departmentResult.department.room && ` • Phòng ${departmentResult.department.room}`}
                  </p>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  Chi tiết
                </span>
              </button>
            )}

            {/* Location results */}
            {results.map((location) => {
              const Icon = getTypeIcon(location.type);
              const colorClass = getTypeColor(location.type);
              
              return (
                <button
                  key={location.id}
                  onClick={() => handleSelect(location)}
                  className="w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                >
                  <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${colorClass}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{location.nameVi}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{location.address}</p>
                  </div>
                  {location.hasVoucher && (
                    <span className="voucher-badge">Voucher</span>
                  )}
                </button>
              );
            })}

            {results.length === 0 && !departmentResult && (
              <div className="p-6 text-center text-muted-foreground">
                Không tìm thấy kết quả
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
