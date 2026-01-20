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
                <p className="text-sm text-muted-foreground">{t('navigatingTo')}</p>
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
          <div className="flex gap-2 mb-2">
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

          {/* Route preference selector */}
          <div className="flex gap-2 mb-3">
            {routePreferences.map(({ preference, icon: Icon, labelKey }) => (
              <button
                key={preference}
                onClick={() => onChangeRoutePreference(preference)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg transition-all text-xs",
                  routePreference === preference
                    ? "bg-secondary text-secondary-foreground border-2 border-primary"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted/80 border-2 border-transparent"
                )}
              >
                <Icon className="w-3 h-3" />
                <span className="font-medium">{t(labelKey)}</span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">{t('calculatingRoute')}</span>
            </div>
          ) : (
            <>
              {/* Current step - realtime navigation */}
              {isTracking && currentStep && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-primary text-primary-foreground p-4 rounded-xl mb-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                      {getManeuverIcon(currentStep.maneuver.type, currentStep.maneuver.modifier)}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold leading-tight">
                        {getTranslatedInstruction(currentStep.instruction)}
                      </p>
                      {distanceToNextStep > 0 && (
                        <p className="text-primary-foreground/80 text-sm mt-1">
                          {t('remaining')} {formatDistance(distanceToNextStep)}
                        </p>
                      )}
                    </div>
                  </div>
                  {nextStep && (
                    <div className="mt-3 pt-3 border-t border-primary-foreground/20 flex items-center gap-2 text-sm text-primary-foreground/70">
                      <span>{t('next')}</span>
                      <span className="font-medium">{getTranslatedInstruction(nextStep.instruction)}</span>
                    </div>
                  )}
                  {userAccuracy && (
                    <div className="mt-2 text-xs text-primary-foreground/60">
                      📍 {t('accuracy')}: ±{Math.round(userAccuracy)}m
                    </div>
                  )}
                </motion.div>
              )}

              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-xl">
                  <Route className="w-4 h-4 text-primary" />
                  <span className="font-medium text-primary">{formatDistance(routeInfo.distance)}</span>
                </div>
                <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-xl">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{formatDuration(routeInfo.duration, language)}</span>
                </div>
                {isTracking && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Live</span>
                  </div>
                )}
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
                      {t('hideInstructions')}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      {t('viewSteps', { count: routeInfo.steps.length })}
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
                  {routeInfo.steps.map((step, index) => {
                    const isCurrentStep = isTracking && index === currentStepIndex;
                    const isCompleted = isTracking && index < currentStepIndex;
                    
                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl transition-all",
                          isCurrentStep ? "bg-primary/20 ring-2 ring-primary" :
                          isCompleted ? "bg-muted/30 opacity-60" :
                          index === 0 ? "bg-primary/10" : 
                          index === routeInfo.steps.length - 1 ? "bg-destructive/10" : "bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          isCurrentStep ? "bg-primary text-primary-foreground" :
                          isCompleted ? "bg-muted text-muted-foreground" :
                          index === 0 ? "bg-primary text-primary-foreground" :
                          index === routeInfo.steps.length - 1 ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          {isCompleted ? (
                            <span className="text-xs">✓</span>
                          ) : (
                            getManeuverIcon(step.maneuver.type, step.maneuver.modifier)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm leading-tight",
                            isCurrentStep ? "text-foreground font-medium" : "text-foreground"
                          )}>
                            {getTranslatedInstruction(step.instruction)}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{formatDistance(step.distance)}</span>
                            <span>•</span>
                            <span>{formatDuration(step.duration, language)}</span>
                            {isCurrentStep && (
                              <span className="text-primary font-medium ml-2">{t('youAreHere')}</span>
                            )}
                          </div>
                        </div>
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
