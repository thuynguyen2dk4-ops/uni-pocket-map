import React, { useState, useMemo } from 'react';
import { 
  Map, Plus, Search, MapPin, Utensils, Coffee, 
  BookOpen, Gamepad2, ImageOff, Star, BadgeCheck, Ticket 
} from 'lucide-react';
import { CATEGORIES, ExtendedLocation } from '@/types/extended';

interface MainSidebarProps {
  locations: ExtendedLocation[];
  onSelectLocation: (loc: ExtendedLocation) => void;
  onAddClick: () => void;
  showTopLists: boolean;
  setShowTopLists: (show: boolean) => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ 
  locations, 
  onSelectLocation, 
  onAddClick, 
  showTopLists, 
  setShowTopLists 
}) => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Logic tìm kiếm thông minh & lọc
  const filteredLocations = useMemo(() => {
    let result = locations;
    
    if (activeCategory !== 'all') {
      result = result.filter(l => l.category === activeCategory);
    }

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(l => 
        l.name.toLowerCase().includes(lowerQuery) || 
        l.description?.toLowerCase().includes(lowerQuery) ||
        l.menu?.some(m => m.name.toLowerCase().includes(lowerQuery))
      );
    }
    return result;
  }, [locations, query, activeCategory]);

  // Logic Top Lists
  const topLocations = useMemo(() => {
    // Giả lập sort nếu chưa có dữ liệu thật
    return [...locations]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
  }, [locations]);

  // Helper render icon dynamic
  const getCategoryIcon = (iconName: string) => {
    switch(iconName) {
        case 'Utensils': return <Utensils size={14} />;
        case 'Coffee': return <Coffee size={14} />;
        case 'BookOpen': return <BookOpen size={14} />;
        case 'Gamepad2': return <Gamepad2 size={14} />;
        default: return <MapPin size={14} />;
    }
  };

  return (
    <div className="absolute left-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-[50] flex flex-col transition-transform duration-300 transform">
      {/* Header */}
      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Map className="w-6 h-6" /> UniMap Pro
        </div>
        <button 
          onClick={onAddClick} 
          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition" 
          title="Thêm địa điểm"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="p-4 space-y-3 border-b shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm quán, món ăn, dịch vụ..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${activeCategory === cat.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {getCategoryIcon(cat.icon)} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b text-sm font-medium shrink-0">
        <button 
          className={`flex-1 py-3 text-center transition-colors ${!showTopLists ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setShowTopLists(false)}
        >
          Khám phá
        </button>
        <button 
          className={`flex-1 py-3 text-center transition-colors ${showTopLists ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setShowTopLists(true)}
        >
          Top Đánh Giá
        </button>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-2">
        {showTopLists ? (
          <div className="space-y-3">
            <h3 className="px-2 text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">Đáng thử nhất tuần này</h3>
            {topLocations.map((loc, index) => (
              <div key={loc.id} onClick={() => onSelectLocation(loc)} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3 cursor-pointer hover:shadow-md transition relative group">
                <div className="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow z-10">
                  #{index + 1}
                </div>
                <div className="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden ml-4">
                  {loc.image ? (
                    <img src={loc.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={loc.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageOff size={24} /></div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{loc.name}</h4>
                  <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1">
                    <Star size={12} fill="currentColor" /> {loc.rating || 0} <span className="text-gray-400">({loc.reviews || 0} reviews)</span>
                  </div>
                  <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                    {CATEGORIES.find(c => c.id === loc.category)?.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLocations.length === 0 ? (
              <div className="text-center p-8 text-gray-400 text-sm">Không tìm thấy địa điểm nào.</div>
            ) : (
              filteredLocations.map(loc => (
                <div key={loc.id} onClick={() => onSelectLocation(loc)} className={`bg-white p-3 rounded-lg shadow-sm border cursor-pointer transition hover:border-indigo-300 flex gap-3 ${loc.type === 'premium' ? 'border-l-4 border-l-yellow-400' : 'border-gray-100'}`}>
                  <div className="w-16 h-16 rounded-md bg-gray-100 flex-shrink-0 overflow-hidden">
                    {loc.image ? (
                        <img src={loc.image} className="w-full h-full object-cover" alt={loc.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><MapPin size={24} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-800 text-sm truncate">{loc.name}</h4>
                      {loc.type === 'premium' && <BadgeCheck size={16} className="text-blue-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{loc.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs text-yellow-500 font-medium">
                        <Star size={12} fill="currentColor" /> {loc.rating || 'N/A'}
                      </div>
                      {loc.vouchers && loc.vouchers.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-red-500 font-medium">
                          <Ticket size={12} /> Voucher
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainSidebar;
