import { Location, VNU_CENTER, locations, LocationType } from '@/data/locations';

interface MapViewProps {
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
  activeCategories: LocationType[];
  flyToLocation?: Location | null;
}

export const MapView = ({ 
  selectedLocation, 
  onSelectLocation, 
  activeCategories,
}: MapViewProps) => {
  const filteredLocations = locations.filter(loc => 
    activeCategories.includes(loc.type)
  );

  const getTypeEmoji = (type: LocationType) => {
    switch (type) {
      case 'building': return '🏢';
      case 'food': return '☕';
      case 'housing': return '🏠';
      case 'job': return '💼';
    }
  };

  const getTypeColor = (type: LocationType) => {
    switch (type) {
      case 'building': return 'bg-primary';
      case 'food': return 'bg-accent';
      case 'housing': return 'bg-[hsl(210,80%,55%)]';
      case 'job': return 'bg-[hsl(270,60%,55%)]';
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-6xl mb-2">🗺️</div>
        <p className="text-muted-foreground font-medium">VNU Xuân Thủy Campus</p>
        <p className="text-xs text-muted-foreground/60">{VNU_CENTER.lat.toFixed(4)}, {VNU_CENTER.lng.toFixed(4)}</p>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {filteredLocations.map((location) => {
          const x = ((location.lng - 105.775) * 4000) % 100;
          const y = ((location.lat - 21.035) * 4000) % 100;
          
          return (
            <button
              key={location.id}
              onClick={() => onSelectLocation(location)}
              className={`
                absolute pointer-events-auto cursor-pointer
                w-10 h-10 rounded-full flex items-center justify-center
                text-lg shadow-lg transform hover:scale-110 transition-transform
                ${getTypeColor(location.type)}
                ${selectedLocation?.id === location.id ? 'ring-4 ring-white scale-125' : ''}
                ${location.isSponsored ? 'animate-pulse-soft' : ''}
              `}
              style={{
                left: `${20 + (x * 0.6)}%`,
                top: `${20 + (y * 0.6)}%`,
              }}
            >
              {getTypeEmoji(location.type)}
              {location.hasVoucher && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[8px]">✨</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground/50 bg-background/50 px-2 py-1 rounded">
        Demo Mode
      </div>
    </div>
  );
};
