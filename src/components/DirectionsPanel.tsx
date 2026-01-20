import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  X, Navigation, Clock, Route, Footprints, Bike, Car, 
  ChevronDown, ChevronUp, ArrowUp, ArrowLeft, ArrowRight, 
  CornerUpLeft, CornerUpRight, MapPin, Flag
} from 'lucide-react';
import { formatDistance, formatDuration, RouteInfo, TransportMode, RouteStep } from '@/hooks/useDirections';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DirectionsPanelProps {
  routeInfo: RouteInfo;
  destinationName: string;
  isLoading: boolean;
  transportMode: TransportMode;
  onClose: () => void;
  onChangeTransportMode: (mode: TransportMode) => void;
}

const transportModes: { mode: TransportMode; icon: typeof Footprints; label: string }[] = [
  { mode: 'walking', icon: Footprints, label: 'Đi bộ' },
  { mode: 'cycling', icon: Bike, label: 'Xe máy' },
  { mode: 'driving', icon: Car, label: 'Ô tô' },
];

const getManeuverIcon = (type: string, modifier?: string) => {
  switch (type) {
    case 'turn':
      if (modifier === 'left' || modifier === 'slight left' || modifier === 'sharp left') {
        return <CornerUpLeft className="w-4 h-4" />;
      }
      if (modifier === 'right' || modifier === 'slight right' || modifier === 'sharp right') {
        return <CornerUpRight className="w-4 h-4" />;
      }
      return <ArrowUp className="w-4 h-4" />;
    case 'depart':
      return <MapPin className="w-4 h-4" />;
    case 'arrive':
      return <Flag className="w-4 h-4" />;
    case 'merge':
    case 'on ramp':
    case 'off ramp':
      return modifier?.includes('left') ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />;
    case 'fork':
      return modifier?.includes('left') ? <CornerUpLeft className="w-4 h-4" /> : <CornerUpRight className="w-4 h-4" />;
    case 'end of road':
      return modifier?.includes('left') ? <CornerUpLeft className="w-4 h-4" /> : <CornerUpRight className="w-4 h-4" />;
    case 'continue':
    case 'new name':
    default:
      return <ArrowUp className="w-4 h-4" />;
  }
};

export const DirectionsPanel = ({
  routeInfo,
  destinationName,
  isLoading,
  transportMode,
  onClose,
  onChangeTransportMode,
}: DirectionsPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="absolute top-32 left-4 right-4 z-30"
    >
      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Navigation className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang chỉ đường đến</p>
                <p className="font-semibold text-foreground line-clamp-1">{destinationName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Transport mode selector */}
          <div className="flex gap-2 mb-3">
            {transportModes.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => onChangeTransportMode(mode)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all",
                  transportMode === mode
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Đang tính toán tuyến đường...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-xl">
                  <Route className="w-4 h-4 text-primary" />
                  <span className="font-medium text-primary">{formatDistance(routeInfo.distance)}</span>
                </div>
                <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-xl">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{formatDuration(routeInfo.duration)}</span>
                </div>
              </div>

              {/* Toggle steps button */}
              {routeInfo.steps && routeInfo.steps.length > 0 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Ẩn hướng dẫn
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Xem {routeInfo.steps.length} bước hướng dẫn
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* Steps list */}
        <AnimatePresence>
          {isExpanded && routeInfo.steps && routeInfo.steps.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ScrollArea className="max-h-64 border-t border-border">
                <div className="p-3 space-y-2">
                  {routeInfo.steps.map((step, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl",
                        index === 0 ? "bg-green-500/10" : 
                        index === routeInfo.steps.length - 1 ? "bg-red-500/10" : "bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        index === 0 ? "bg-green-500 text-white" :
                        index === routeInfo.steps.length - 1 ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {getManeuverIcon(step.maneuver.type, step.maneuver.modifier)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-tight">
                          {step.instruction || 'Tiếp tục đi thẳng'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{formatDistance(step.distance)}</span>
                          <span>•</span>
                          <span>{formatDuration(step.duration)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
