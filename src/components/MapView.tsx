import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Location, VNU_CENTER, locations, LocationType } from '@/data/locations';
import { CustomMarker } from './map/CustomMarker';
import { BuildingLabel } from './map/BuildingLabel';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
  activeCategories: LocationType[];
  flyToLocation?: Location | null;
}

// Component to handle map flying
const FlyToHandler = ({ location }: { location: Location | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 17, {
        duration: 1,
      });
    }
  }, [location, map]);
  
  return null;
};

export const MapView = ({ 
  selectedLocation, 
  onSelectLocation, 
  activeCategories,
  flyToLocation 
}: MapViewProps) => {
  const filteredLocations = locations.filter(loc => 
    activeCategories.includes(loc.type)
  );

  return (
    <MapContainer
      center={[VNU_CENTER.lat, VNU_CENTER.lng]}
      zoom={16}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        maxZoom={19}
      />
      
      <FlyToHandler location={flyToLocation || null} />
      
      {/* Building labels */}
      {filteredLocations
        .filter(loc => loc.type === 'building')
        .map((location) => (
          <BuildingLabel
            key={`label-${location.id}`}
            location={location}
            onClick={onSelectLocation}
            isSelected={selectedLocation?.id === location.id}
          />
        ))}
      
      {/* Custom markers */}
      {filteredLocations.map((location) => (
        <CustomMarker
          key={location.id}
          location={location}
          onClick={onSelectLocation}
          isSelected={selectedLocation?.id === location.id}
        />
      ))}
    </MapContainer>
  );
};
