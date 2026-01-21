import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '@/data/locations';

interface BuildingLabelProps {
  location: Location;
  onClick: (location: Location) => void;
  isSelected?: boolean;
}

export const BuildingLabel = ({ location, onClick, isSelected = false }: BuildingLabelProps) => {
  if (location.type !== 'building') return null;
  
  const bgColor = isSelected ? '#2f855a' : 'white';
  const textColor = isSelected ? 'white' : '#1a202c';
  const shadow = isSelected 
    ? '0 4px 15px rgba(46, 125, 50, 0.4)' 
    : '0 2px 8px rgba(0, 0, 0, 0.15)';
  
  const labelHtml = `
    <div style="
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 13px;
      white-space: nowrap;
      cursor: pointer;
      background: ${bgColor};
      color: ${textColor};
      box-shadow: ${shadow};
      border: ${isSelected ? 'none' : '1px solid rgba(0, 0, 0, 0.05)'};
      font-family: 'Be Vietnam Pro', sans-serif;
    ">
      ${location.name.replace('Building ', '')}
    </div>
  `;

  return (
    <Marker
      position={[location.lat + 0.0003, location.lng]}
      icon={L.divIcon({
        html: labelHtml,
        className: 'building-label',
        iconSize: [60, 30],
        iconAnchor: [30, 45],
      })}
      eventHandlers={{
        click: () => onClick(location),
      }}
    />
  );
};
