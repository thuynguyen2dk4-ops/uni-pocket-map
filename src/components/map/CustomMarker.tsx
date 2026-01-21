import React from 'react';
import { Marker } from 'react-map-gl';
import { MapPin, Crown } from 'lucide-react';

interface CustomMarkerProps {
  longitude: number;
  latitude: number;
  onClick?: () => void;
  type?: 'free' | 'premium';
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ 
  longitude, 
  latitude, 
  onClick,
  type = 'free' 
}) => {
  const isPremium = type === 'premium';

  return (
    <Marker longitude={longitude} latitude={latitude} anchor="bottom" onClick={(e) => {
      e.originalEvent.stopPropagation();
      onClick?.();
    }}>
      <div 
        className={`
            relative cursor-pointer transition-transform hover:scale-110
            flex items-center justify-center
            ${isPremium ? 'text-yellow-500' : 'text-indigo-600'}
        `}
      >
        <div className={`
            p-1.5 rounded-full shadow-lg border-2 border-white
            ${isPremium ? 'bg-yellow-500' : 'bg-indigo-600'}
        `}>
           {isPremium ? (
               <Crown size={16} className="text-white" />
           ) : (
               <MapPin size={16} className="text-white" />
           )}
        </div>
        
        <div className={`
            absolute -bottom-1 left-1/2 transform -translate-x-1/2
            w-0 h-0 
            border-l-[4px] border-l-transparent
            border-r-[4px] border-r-transparent
            border-t-[6px] 
            ${isPremium ? 'border-t-yellow-500' : 'border-t-indigo-600'}
        `}></div>
      </div>
    </Marker>
  );
};

export default CustomMarker;
