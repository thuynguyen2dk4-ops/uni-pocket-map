import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { locations } from '../data/locations'; // Import file dữ liệu HUST của bạn

const LocationDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  
  // Tìm địa điểm trong data
  const location = locations.find(loc => loc.id === id);

  if (!location) {
    return <div className="p-4 text-center">Không tìm thấy địa điểm này!</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      {/* Nút quay lại */}
      <button 
        onClick={() => navigate('/')}
        className="self-start mb-4 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
      >
        ← Quay lại Bản đồ
      </button>

      {/* Nội dung chi tiết chuẩn SEO */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl w-full">
        <img 
          src={location.image} 
          alt={location.name} 
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{location.name}</h1>
          <p className="text-gray-500 mb-4 italic">{location.address}</p>
          
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-2">Giới thiệu</h3>
            <p className="text-gray-700 leading-relaxed">
              {location.description}
            </p>
            
            {/* Phần này để Google đọc */}
            <div className="mt-6 pt-6 border-t border-gray-100">
               <p><strong>Loại địa điểm:</strong> {location.type}</p>
               {location.tags && (
                 <p className="mt-2">
                   <strong>Từ khóa:</strong> {location.tags.join(', ')}
                 </p>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetail;