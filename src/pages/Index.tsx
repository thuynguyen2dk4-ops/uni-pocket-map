import React, { useState } from 'react';
import MapView from '@/components/MapView';
import MainSidebar from '@/components/MainSidebar';
import LocationDetailModal from '@/components/LocationDetailModal';
import StoreFormModal from '@/components/store/StoreFormModal';
import { ExtendedLocation } from '@/types/extended';
import { Toaster } from "@/components/ui/toaster";
// SỬA LỖI IMPORT Ở ĐÂY: Dùng named import { useToast } thay vì default
import { useToast } from "@/components/ui/use-toast";

const INITIAL_LOCATIONS: ExtendedLocation[] = [
    { id: 1, name: "Thư viện Trung Tâm", lat: 10.762622, lng: 106.660172, category: "study", type: "free", rating: 4.8, reviews: 120, description: "Không gian yên tĩnh, wifi mạnh.", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=300" },
    { id: 2, name: "Cà phê Sách Nhã Nam", lat: 10.763000, lng: 106.661000, category: "coffee", type: "premium", rating: 4.5, reviews: 85, description: "Nhiều sách hay, đồ uống ngon.", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=300", 
      menu: [{name: "Cà phê sữa", price: 35000}, {name: "Trà đào", price: 40000}], 
      vouchers: [{code: "STUDENT10", desc: "Giảm 10% cho sinh viên"}] 
    },
    { id: 3, name: "Cơm Tấm Đêm", lat: 10.761500, lng: 106.659000, category: "food", type: "free", rating: 4.2, reviews: 200, description: "Cơm tấm sườn bì chả siêu ngon.", image: "" },
    { id: 4, name: "Khu vui chơi Bowling", lat: 10.764000, lng: 106.662000, category: "entertainment", type: "premium", rating: 4.7, reviews: 50, description: "Sàn bowling hiện đại.", image: "https://images.unsplash.com/photo-1538515533358-0c679a94157d?auto=format&fit=crop&q=80&w=300",
      menu: [{name: "Vé chơi 1 game", price: 50000}],
      vouchers: [{code: "TEAM4", desc: "Đi 4 tính tiền 3"}]
    }
];

const Index = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<ExtendedLocation[]>(INITIAL_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<ExtendedLocation | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTopLists, setShowTopLists] = useState(false);

  const handleAddStore = (newStoreData: any) => {
    const newLocation: ExtendedLocation = {
        id: Date.now(),
        ...newStoreData,
        rating: 0,
        reviews: 0
    };
    setLocations(prev => [...prev, newLocation]);
    toast({
        title: "Thành công!",
        description: `Đã tạo cửa hàng: ${newStoreData.name}`,
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans relative">
      <MainSidebar 
        locations={locations}
        onSelectLocation={setSelectedLocation}
        onAddClick={() => setShowAddModal(true)}
        showTopLists={showTopLists}
        setShowTopLists={setShowTopLists}
      />

      <div className="flex-1 relative md:ml-96 h-full transition-all duration-300">
        <MapView 
            locations={locations as any} 
            onMarkerClick={(loc) => setSelectedLocation(loc as ExtendedLocation)}
        />
      </div>

      <LocationDetailModal 
        location={selectedLocation} 
        onClose={() => setSelectedLocation(null)} 
      />

      <StoreFormModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddStore}
      />

      <Toaster />
    </div>
  );
};

export default Index;
