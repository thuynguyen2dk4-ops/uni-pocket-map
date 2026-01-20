import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '@/data/locations';

interface CustomMarkerProps {
  location: Location;
  onClick: (location: Location) => void;
  isSelected?: boolean;
}

const getMarkerIcon = (location: Location, isSelected: boolean) => {
  const isSponsored = location.isSponsored;
  const size = isSponsored ? 40 : 32;
  
  let bgColor = '';
  let emoji = '';
  
  switch (location.type) {
    case 'building':
      bgColor = '#2f855a'; // green
      emoji = '🏢';
      break;
    case 'food':
      bgColor = '#ed8936'; // orange
      emoji = '☕';
      break;
    case 'housing':
      bgColor = '#3182ce'; // blue
      emoji = '🏠';
      break;
    case 'job':
      bgColor = '#805ad5'; // purple
      emoji = '💼';
      break;
  }
  
  const selectedStyle = isSelected ? 'transform: scale(1.2); box-shadow: 0 0 0 4px white;' : '';
  const voucherBadge = location.hasVoucher 
    ? `<div style="position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; background: #ffd700; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 8px;">✨</div>` 
    : '';
  
  const html = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      background: ${bgColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${size * 0.5}px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      ${selectedStyle}
    ">
      ${emoji}
      ${voucherBadge}
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export const CustomMarker = ({ location, onClick, isSelected = false }: CustomMarkerProps) => {
  return (
    <Marker
      position={[location.lat, location.lng]}
      icon={getMarkerIcon(location, isSelected)}
      eventHandlers={{
        click: () => onClick(location),
      }}
    />
  );
};
