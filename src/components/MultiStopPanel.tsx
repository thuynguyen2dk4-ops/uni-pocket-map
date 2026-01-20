import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useState } from 'react';
import { 
  X, Navigation, Clock, Route, Footprints, Bike, Car, 
  ChevronDown, ChevronUp, Plus, Trash2, GripVertical, MapPin, Flag, Circle
} from 'lucide-react';
import { MultiStopRouteInfo, TransportMode, formatDistance, formatDuration, RouteLeg, Waypoint } from '@/hooks/useMultiStopDirections';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/i18n/LanguageContext';
import { TranslationKey } from '@/i18n/translations';
import { translateInstruction } from '@/lib/translateDirections';
import { Button } from '@/components/ui/button';
import { AnimatedText } from '@/components/AnimatedText';

interface MultiStopPanelProps {
  routeInfo: MultiStopRouteInfo | null;
  waypoints: Waypoint[];
  isLoading: boolean;
  transportMode: TransportMode;
  onClose: () => void;
  onChangeTransportMode: (mode: TransportMode) => void;
  onRemoveWaypoint: (index: number) => void;
  onReorderWaypoints: (newOrder: Waypoint[]) => void;
  onAddStop: () => void;
  isAddingStop: boolean;
}

export const MultiStopPanel = ({
  routeInfo,
  waypoints,
  isLoading,
  transportMode,
  onClose,
  onChangeTransportMode,
  onRemoveWaypoint,
  onReorderWaypoints,
  onAddStop,
  isAddingStop,
}: MultiStopPanelProps) => {
  const { t, language } = useLanguage();
  const [expandedLeg, setExpandedLeg] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Create draggable waypoints (exclude origin - index 0)
  const draggableWaypoints = routeInfo?.waypoints.slice(1) || [];
  
  const getTranslatedInstruction = (instruction: string) => {
    return translateInstruction(instruction, language) || t('continueStright');
  };

  const transportModes: { mode: TransportMode; icon: typeof Footprints; labelKey: TranslationKey }[] = [
    { mode: 'walking', icon: Footprints, labelKey: 'walking' },
    { mode: 'cycling', icon: Bike, labelKey: 'cycling' },
    { mode: 'driving', icon: Car, labelKey: 'driving' },
  ];

  // Minimized view
  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="absolute top-16 left-3 right-3 z-30"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-card/95 backdrop-blur-sm rounded-full shadow-lg border border-border"
        >
          <Route className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-medium text-foreground">{waypoints.length} {language === 'vi' ? 'điểm' : 'stops'}</span>
          {routeInfo && (
            <>
              <span className="text-xs font-bold text-purple-600">{formatDistance(routeInfo.totalDistance)}</span>
              <span className="text-xs text-muted-foreground">{formatDuration(routeInfo.totalDuration, language)}</span>
            </>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="absolute top-16 left-3 right-3 z-30"
    >
      <div className="bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-border p-2">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-2">
          <Route className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <span className="text-xs font-medium text-foreground">{waypoints.length} {language === 'vi' ? 'điểm' : 'stops'}</span>
          
          {/* Transport mode */}
          <div className="flex bg-muted/50 rounded-md p-0.5">
            {transportModes.map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => onChangeTransportMode(mode)}
                className={cn(
                  "p-1 rounded transition-all",
                  transportMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3 h-3" />
              </button>
            ))}
          </div>
          
          {routeInfo && (
            <>
              <span className="text-xs font-bold text-purple-600">{formatDistance(routeInfo.totalDistance)}</span>
              <span className="text-xs text-muted-foreground">{formatDuration(routeInfo.totalDuration, language)}</span>
            </>
          )}
          
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-muted rounded">
              <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button onClick={onClose} className="p-1 hover:bg-destructive/20 rounded">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Compact waypoints list */}
        <div className="flex items-center gap-1 flex-wrap mb-2">
          {routeInfo?.waypoints.map((wp, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white",
                i === 0 ? "bg-green-500" : i === routeInfo.waypoints.length - 1 ? "bg-red-500" : "bg-primary"
              )}>
                {i === 0 ? '●' : i === routeInfo.waypoints.length - 1 ? '◆' : i}
              </span>
              <span className="text-[10px] text-foreground max-w-16 truncate">{wp.name.split(' ')[0]}</span>
              {i < routeInfo.waypoints.length - 1 && <span className="text-muted-foreground text-[10px]">→</span>}
            </div>
          ))}
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onAddStop}
            variant="outline"
            size="sm"
            className="h-7 text-[10px] border-dashed flex-1"
            disabled={isAddingStop}
          >
            <Plus className="w-3 h-3 mr-1" />
            {isAddingStop ? (language === 'vi' ? 'Chọn...' : 'Select...') : (language === 'vi' ? 'Thêm' : 'Add')}
          </Button>
          
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
