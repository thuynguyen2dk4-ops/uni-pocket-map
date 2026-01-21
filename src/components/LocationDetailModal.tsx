import React, { useState } from 'react';
import { 
  Image as ImageIcon, X, Crown, Ticket, Star, StarHalf 
} from 'lucide-react';
import { ExtendedLocation } from '@/types/extended';
import { Button } from './ui/button';

interface LocationDetailModalProps {
  location: ExtendedLocation | null;
  onClose: () => void;
}

const LocationDetailModal: React.FC<LocationDetailModalProps> = ({ location, onClose }) => {
  if (!location) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'menu' | 'reviews'>('info');

  return (
    <div className="fixed inset-0 z-[1100] flex items-end md:items-center justify-center pointer-events-none p-0 md:p-4">
      {/* Overlay for mobile mainly */}
      <div className="absolute inset-0 bg-black/20 md:bg-transparent pointer-events-auto" onClick={onClose} />
      
      <div className="bg-white w-full md:w-[500px] md:rounded-2xl shadow-2xl pointer-events-auto h-[80vh] md:h-auto flex flex-col animate-in slide-in-from-bottom-10 duration-300 relative z-10 rounded-t-2xl overflow-hidden">
        {/* Header Image */}
        <div className="h-48 bg-gray-200 relative shrink-0 overflow-hidden">
          {location.image ? (
            <img src={location.image} className="w-full h-full object-cover" alt={location.name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
              <ImageIcon size={48} />
            </div>
          )}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
          >
            <X size={20} />
          </button>
          {location.type === 'premium' && (
            <div className="absolute bottom-4 left-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Crown size={14} /> Official Store
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto bg-white">
          <h2 className="text-2xl font-bold text-gray-900">{location.name}</h2>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <span>📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b mt-6">
            <button onClick={() => setActiveTab('info')} className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === 'info' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>Thông tin</button>
            {location.type === 'premium' && (
                <button onClick={() => setActiveTab('menu')} className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === 'menu' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>Menu & Voucher</button>
            )}
            <button onClick={() => setActiveTab('reviews')} className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === 'reviews' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>Đánh giá</button>
          </div>

          <div className="mt-4">
            {activeTab === 'info' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <p className="text-gray-600 leading-relaxed text-sm">{location.description || "Chưa có mô tả chi tiết."}</p>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Tiện ích</h4>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-white border rounded text-xs text-gray-600">Wifi miễn phí</span>
                    <span className="px-2 py-1 bg-white border rounded text-xs text-gray-600">Gửi xe máy</span>
                    <span className="px-2 py-1 bg-white border rounded text-xs text-gray-600">Điều hòa</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'menu' && location.type === 'premium' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Vouchers */}
                {location.vouchers && location.vouchers.map((v, i) => (
                  <div key={i} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-3 rounded-lg shadow-md flex justify-between items-center relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="text-xs opacity-90">Mã giảm giá</div>
                      <div className="font-bold text-lg">{v.code}</div>
                      <div className="text-sm">{v.desc}</div>
                    </div>
                    <Ticket className="text-white/20 absolute right-[-10px] bottom-[-10px] w-16 h-16" />
                  </div>
                ))}
                
                {/* Menu List */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-2 text-sm">Thực đơn nổi bật</h4>
                  <ul className="space-y-2">
                    {location.menu && location.menu.map((item, i) => (
                      <li key={i} className="flex justify-between items-center p-2 border-b border-dashed text-sm">
                        <span>{item.name}</span>
                        <span className="font-semibold text-indigo-600">{item.price.toLocaleString()}đ</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500">{location.rating || 0}</div>
                    <div className="flex text-yellow-400 gap-0.5 justify-center">
                        <Star fill="currentColor" size={14} />
                        <Star fill="currentColor" size={14} />
                        <Star fill="currentColor" size={14} />
                        <Star fill="currentColor" size={14} />
                        <StarHalf fill="currentColor" size={14} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{location.reviews || 0} đánh giá</div>
                  </div>
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">Viết đánh giá</Button>
                </div>
                
                {/* Dummy Reviews */}
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm">Nguyễn Văn A</span>
                      <span className="text-xs text-gray-400">2 ngày trước</span>
                    </div>
                    <div className="flex text-yellow-400 text-xs mb-1 gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} fill="currentColor" size={10} />)}
                    </div>
                    <p className="text-sm text-gray-600">Rất tuyệt vời, sẽ quay lại!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailModal;
