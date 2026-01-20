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
          className="w-full flex items-center gap-3 p-2.5 bg-card/95 backdrop-blur-sm rounded-full shadow-lg border border-border"
        >
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Route className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-foreground">
              {waypoints.length} {language === 'vi' ? 'điểm' : 'stops'}
            </p>
          </div>
          {routeInfo && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-purple-600">{formatDistance(routeInfo.totalDistance)}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{formatDuration(routeInfo.totalDuration, language)}</span>
            </div>
          )}
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
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
      <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-xl border border-border overflow-hidden max-h-[60vh] flex flex-col">
        <div className="p-3">
          {/* Compact header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Route className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground">
                  {waypoints.length} {language === 'vi' ? 'điểm dừng' : 'stops'}
                </p>
              </div>
            </div>
            
            {/* Transport icons */}
            <div className="flex bg-muted/50 rounded-lg p-0.5 mr-2">
              {transportModes.map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => onChangeTransportMode(mode)}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    transportMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="w-7 h-7 bg-muted/50 hover:bg-muted rounded-full flex items-center justify-center"
              >
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 bg-muted/50 hover:bg-destructive/20 rounded-full flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Scrollable waypoints list */}
          <ScrollArea className="max-h-32 mb-2">
            <div className="space-y-1.5 pr-2">
              {/* Origin - compact */}
              {routeInfo?.waypoints[0] && (
                <div className="flex items-center gap-2 p-1.5 bg-muted/30 rounded-lg">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500 text-white">
                    <Circle className="w-3 h-3 fill-current" />
                  </div>
                  <p className="text-xs font-medium text-foreground truncate flex-1">
                    {routeInfo.waypoints[0].name}
                  </p>
                </div>
              )}
              {/* Draggable waypoints - compact */}
              {draggableWaypoints.length > 0 && (
                <Reorder.Group
                  axis="y"
                  values={draggableWaypoints}
                  onReorder={(newOrder) => onReorderWaypoints(newOrder)}
                  className="space-y-1.5"
                >
                  {draggableWaypoints.map((waypoint, index) => {
                    const isLast = index === draggableWaypoints.length - 1;
                    const legIndex = index;
                    
                    return (
                      <Reorder.Item
                        key={waypoint.name + index}
                        value={waypoint}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={() => setIsDragging(false)}
                        className="cursor-grab active:cursor-grabbing"
                        whileDrag={{ scale: 1.02, zIndex: 50 }}
                      >
                        <motion.div
                          layout
                          className={cn(
                            "flex items-center gap-1.5 p-1.5 rounded-lg transition-colors",
                            isDragging ? "bg-muted" : "bg-muted/30 hover:bg-muted/50"
                          )}
                        >
                          <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                            isLast ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
                          )}>
                            {isLast ? <Flag className="w-3 h-3" /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{waypoint.name}</p>
                            {routeInfo?.legs[legIndex] && (
                              <p className="text-[10px] text-muted-foreground">
                                {formatDistance(routeInfo.legs[legIndex].distance)}
                              </p>
                            )}
                          </div>
                          
                          <button
                            onClick={(e) => { e.stopPropagation(); onRemoveWaypoint(index); }}
                            className="w-5 h-5 bg-destructive/10 hover:bg-destructive/20 rounded-full flex items-center justify-center"
                          >
                            <Trash2 className="w-2.5 h-2.5 text-destructive" />
                          </button>
                        </motion.div>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              )}
            </div>
          </ScrollArea>

          {/* Add stop button */}
          {/* Add stop button - compact */}
          <Button
            onClick={onAddStop}
            variant="outline"
            size="sm"
            className="w-full mb-2 border-dashed h-8 text-xs"
            disabled={isAddingStop}
          >
            <Plus className="w-3 h-3 mr-1" />
            {isAddingStop 
              ? (language === 'vi' ? 'Chọn trên bản đồ...' : 'Select on map...')
              : (language === 'vi' ? 'Thêm điểm' : 'Add stop')
            }
          </Button>

          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="ml-2 text-xs text-muted-foreground">{t('calculatingRoute')}</span>
            </div>
          ) : routeInfo && (
            /* Total summary - compact inline */
            <div className="flex items-center justify-between p-2 bg-purple-500/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Route className="w-3 h-3 text-purple-600" />
                  <span className="text-xs font-bold text-purple-600">{formatDistance(routeInfo.totalDistance)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{formatDuration(routeInfo.totalDuration, language)}</span>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">{language === 'vi' ? 'Tổng' : 'Total'}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
