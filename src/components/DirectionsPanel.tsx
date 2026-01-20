import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  X, Navigation, Clock, Route, Footprints, Bike, Car,
  ChevronDown, ChevronUp, ArrowUp, ArrowLeft, ArrowRight, 
  CornerUpLeft, CornerUpRight, MapPin, Flag, Gauge, Ruler
} from 'lucide-react';
import { formatDistance, formatDuration, RouteInfo, TransportMode, RouteStep, RoutePreference } from '@/hooks/useDirections';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/i18n/LanguageContext';
import { TranslationKey } from '@/i18n/translations';
import { translateInstruction } from '@/lib/translateDirections';

interface DirectionsPanelProps {
  routeInfo: RouteInfo;
  destinationName: string;
  isLoading: boolean;
  transportMode: TransportMode;
  routePreference: RoutePreference;
  currentStepIndex?: number;
  distanceToNextStep?: number;
  isTracking?: boolean;
  userAccuracy?: number | null;
  onClose: () => void;
  onChangeTransportMode: (mode: TransportMode) => void;
  onChangeRoutePreference: (preference: RoutePreference) => void;
}

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
  routePreference,
  currentStepIndex = 0,
  distanceToNextStep = 0,
  isTracking = false,
  userAccuracy,
  onClose,
  onChangeTransportMode,
  onChangeRoutePreference,
}: DirectionsPanelProps) => {
  const { t, language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Helper to translate instruction
  const getTranslatedInstruction = (instruction: string) => {
    return translateInstruction(instruction, language) || t('continueStright');
  };

  // Get current step for prominent display
  const currentStep = routeInfo.steps[currentStepIndex];
  const nextStep = routeInfo.steps[currentStepIndex + 1];

  const transportModes: { mode: TransportMode; icon: typeof Footprints; labelKey: TranslationKey }[] = [
    { mode: 'walking', icon: Footprints, labelKey: 'walking' },
    { mode: 'cycling', icon: Bike, labelKey: 'cycling' },
    { mode: 'driving', icon: Car, labelKey: 'driving' },
  ];

  const routePreferences: { preference: RoutePreference; icon: typeof Ruler; labelKey: TranslationKey }[] = [
    { preference: 'shortest', icon: Ruler, labelKey: 'shortest' },
    { preference: 'fastest', icon: Gauge, labelKey: 'fastest' },
  ];

  // Minimized view - just a small floating pill
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
          <Navigation className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-foreground truncate flex-1 text-left">{destinationName}</span>
          <span className="text-xs font-bold text-primary">{formatDistance(routeInfo.distance)}</span>
          <span className="text-xs text-muted-foreground">{formatDuration(routeInfo.duration, language)}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
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
        {/* Single row header */}
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-xs font-medium text-foreground truncate flex-1">{destinationName}</span>
          
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
          
          {/* Route info */}
          <span className="text-xs font-bold text-primary">{formatDistance(routeInfo.distance)}</span>
          <span className="text-xs text-muted-foreground">{formatDuration(routeInfo.duration, language)}</span>
          
          
          {/* Expand steps button */}
          {routeInfo.steps?.length > 0 && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-muted rounded">
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          )}
          
          <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-muted rounded">
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-destructive/20 rounded">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Realtime tracking info - only show when active */}
        {isTracking && currentStep && (
          <div className="mt-2 p-2 bg-primary/10 rounded-lg flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-primary-foreground">
              {getManeuverIcon(currentStep.maneuver.type, currentStep.maneuver.modifier)}
            </div>
            <p className="text-xs text-foreground flex-1 truncate">
              {getTranslatedInstruction(currentStep.instruction)}
            </p>
            {distanceToNextStep > 0 && (
              <span className="text-xs text-primary font-medium">{formatDistance(distanceToNextStep)}</span>
            )}
          </div>
        )}

        {/* Expandable steps list */}
        <AnimatePresence>
          {isExpanded && routeInfo.steps && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ScrollArea className="max-h-40 mt-2 border-t border-border pt-2">
                <div className="space-y-1">
                  {routeInfo.steps.map((step, index) => {
                    const isCurrentStep = isTracking && index === currentStepIndex;
                    const isCompleted = isTracking && index < currentStepIndex;
                    
                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-2 p-1.5 rounded-lg text-xs",
                          isCurrentStep ? "bg-primary/20" : isCompleted ? "opacity-50" : "bg-muted/30"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]",
                          isCurrentStep ? "bg-primary text-primary-foreground" :
                          index === 0 ? "bg-primary text-primary-foreground" :
                          index === routeInfo.steps.length - 1 ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          {isCompleted ? '✓' : getManeuverIcon(step.maneuver.type, step.maneuver.modifier)}
                        </div>
                        <span className="flex-1 truncate text-foreground">{getTranslatedInstruction(step.instruction)}</span>
                        <span className="text-muted-foreground">{formatDistance(step.distance)}</span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
