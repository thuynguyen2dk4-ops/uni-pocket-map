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
  onReorderWaypoints: (fromIndex: number, toIndex: number) => void;
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
  
  const getTranslatedInstruction = (instruction: string) => {
    return translateInstruction(instruction, language) || t('continueStright');
  };

  const transportModes: { mode: TransportMode; icon: typeof Footprints; labelKey: TranslationKey }[] = [
    { mode: 'walking', icon: Footprints, labelKey: 'walking' },
    { mode: 'cycling', icon: Bike, labelKey: 'cycling' },
    { mode: 'driving', icon: Car, labelKey: 'driving' },
  ];

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="absolute top-32 left-4 right-4 z-30"
    >
      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Route className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <AnimatedText as="p" className="text-sm text-muted-foreground">
                  {language === 'vi' ? 'Lộ trình nhiều điểm' : 'Multi-stop Route'}
                </AnimatedText>
                <p className="font-semibold text-foreground">
                  {waypoints.length} {language === 'vi' ? 'điểm dừng' : 'stops'}
                </p>
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
            {transportModes.map(({ mode, icon: Icon, labelKey }) => (
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
                <span className="text-sm font-medium">{t(labelKey)}</span>
              </button>
            ))}
          </div>

          {/* Waypoints list */}
          <div className="space-y-2 mb-3">
            {routeInfo?.waypoints.map((waypoint, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded-xl"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  index === 0 
                    ? "bg-green-500 text-white" 
                    : index === routeInfo.waypoints.length - 1 
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-primary text-primary-foreground"
                )}>
                  {index === 0 ? (
                    <Circle className="w-4 h-4 fill-current" />
                  ) : index === routeInfo.waypoints.length - 1 ? (
                    <Flag className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{index}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {waypoint.name}
                  </p>
                  {index > 0 && routeInfo.legs[index - 1] && (
                    <p className="text-xs text-muted-foreground">
                      {formatDistance(routeInfo.legs[index - 1].distance)} • {formatDuration(routeInfo.legs[index - 1].duration, language)}
                    </p>
                  )}
                </div>
                {index > 0 && index < routeInfo.waypoints.length && (
                  <button
                    onClick={() => onRemoveWaypoint(index - 1)}
                    className="w-7 h-7 bg-destructive/10 hover:bg-destructive/20 rounded-full flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Add stop button */}
          <Button
            onClick={onAddStop}
            variant="outline"
            className="w-full mb-3 border-dashed"
            disabled={isAddingStop}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAddingStop 
              ? (language === 'vi' ? 'Chọn điểm trên bản đồ...' : 'Select point on map...')
              : (language === 'vi' ? 'Thêm điểm dừng' : 'Add stop')
            }
          </Button>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">{t('calculatingRoute')}</span>
            </div>
          ) : routeInfo && (
            <>
              {/* Total summary */}
              <div className="flex items-center gap-4 mb-3 p-3 bg-primary/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-primary" />
                  <span className="font-bold text-primary">{formatDistance(routeInfo.totalDistance)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold text-foreground">{formatDuration(routeInfo.totalDuration, language)}</span>
                </div>
                <div className="text-xs text-muted-foreground ml-auto">
                  {language === 'vi' ? 'Tổng cộng' : 'Total'}
                </div>
              </div>

              {/* Legs detail */}
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {routeInfo.legs.map((leg, index) => (
                    <div key={index} className="border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedLeg(expandedLeg === index ? null : index)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-foreground">
                            {leg.originName} → {leg.destinationName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistance(leg.distance)} • {formatDuration(leg.duration, language)}
                          </p>
                        </div>
                        {expandedLeg === index ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedLeg === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border"
                          >
                            <div className="p-2 space-y-1">
                              {leg.steps.map((step, stepIndex) => (
                                <div
                                  key={stepIndex}
                                  className="flex items-start gap-2 p-2 rounded-lg bg-muted/30"
                                >
                                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-[10px] text-muted-foreground">{stepIndex + 1}</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs text-foreground">
                                      {getTranslatedInstruction(step.instruction)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {formatDistance(step.distance)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
