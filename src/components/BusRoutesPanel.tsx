import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  X, Bus, Clock, MapPin, ChevronDown, ChevronUp, 
  ChevronRight, Circle, Banknote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/i18n/LanguageContext';
import { BusRoute, getNextDepartures, getWaitTime, formatFare } from '@/data/busRoutes';
import { Badge } from '@/components/ui/badge';

interface BusRoutesPanelProps {
  routes: BusRoute[];
  selectedRoute: BusRoute | null;
  onSelectRoute: (route: BusRoute | null) => void;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export const BusRoutesPanel = ({
  routes,
  selectedRoute,
  onSelectRoute,
  onClose,
  isMinimized,
  onToggleMinimize,
}: BusRoutesPanelProps) => {
  const { language } = useLanguage();
  const [expandedSchedule, setExpandedSchedule] = useState<string | null>(null);
  
  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

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
          onClick={onToggleMinimize}
          className="w-full flex items-center gap-2 px-3 py-2 bg-card/95 backdrop-blur-sm rounded-full shadow-lg border border-border"
        >
          <Bus className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium text-foreground">
            {routes.length} {language === 'vi' ? 'tuyến bus' : 'bus routes'}
          </span>
          {selectedRoute && (
            <Badge 
              style={{ backgroundColor: selectedRoute.color }} 
              className="text-white text-[10px] px-1.5"
            >
              {selectedRoute.number}
            </Badge>
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
      <div className="bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-border overflow-hidden max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="p-2 border-b border-border flex items-center gap-2">
          <Bus className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium text-foreground flex-1">
            {language === 'vi' ? 'Tuyến xe buýt' : 'Bus Routes'}
          </span>
          <button onClick={onToggleMinimize} className="p-1 hover:bg-muted rounded">
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-destructive/20 rounded">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {routes.map((route) => {
              const nextDepartures = getNextDepartures(route, 3);
              const isSelected = selectedRoute?.id === route.id;
              const isExpanded = expandedSchedule === route.id;
              
              return (
                <div
                  key={route.id}
                  className={cn(
                    "rounded-lg border transition-all",
                    isSelected ? "border-primary bg-primary/5" : "border-border bg-muted/30"
                  )}
                >
                  {/* Route header */}
                  <button
                    onClick={() => onSelectRoute(isSelected ? null : route)}
                    className="w-full p-2 flex items-center gap-2 text-left"
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: route.color }}
                    >
                      {route.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {language === 'vi' ? route.name : route.nameEn}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {route.stops.length} {language === 'vi' ? 'điểm dừng' : 'stops'} • {formatFare(route.fare, language)}
                      </p>
                    </div>
                    {nextDepartures.length > 0 && (
                      <div className="text-right">
                        <p className="text-xs font-bold text-primary">{nextDepartures[0]}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {getWaitTime(nextDepartures[0])} {language === 'vi' ? 'phút' : 'min'}
                        </p>
                      </div>
                    )}
                    <ChevronRight className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform",
                      isSelected && "rotate-90"
                    )} />
                  </button>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-2 pb-2 space-y-2">
                          {/* Operating hours & frequency */}
                          <div className="flex gap-2 text-[10px]">
                            <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span>{route.operatingHours.start} - {route.operatingHours.end}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
                              <span>{language === 'vi' ? 'Tần suất:' : 'Freq:'}</span>
                              <span className="font-medium">
                                {isWeekend ? route.frequency.weekend : route.frequency.weekday}
                              </span>
                            </div>
                          </div>

                          {/* Stops list */}
                          <div className="space-y-1">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase">
                              {language === 'vi' ? 'Lộ trình' : 'Route'}
                            </p>
                            {route.stops.map((stop, idx) => (
                              <div key={stop.id + idx} className="flex items-center gap-2">
                                <div className="flex flex-col items-center">
                                  <Circle 
                                    className="w-2 h-2" 
                                    style={{ 
                                      color: route.color,
                                      fill: idx === 0 || idx === route.stops.length - 1 ? route.color : 'transparent'
                                    }} 
                                  />
                                  {idx < route.stops.length - 1 && (
                                    <div 
                                      className="w-0.5 h-4" 
                                      style={{ backgroundColor: route.color + '40' }}
                                    />
                                  )}
                                </div>
                                <span className="text-[10px] text-foreground">
                                  {language === 'vi' ? stop.name : stop.nameEn}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Next departures */}
                          {nextDepartures.length > 0 && (
                            <div>
                              <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">
                                {language === 'vi' ? 'Chuyến tiếp theo' : 'Next departures'}
                              </p>
                              <div className="flex gap-1 flex-wrap">
                                {nextDepartures.map((time, idx) => (
                                  <Badge 
                                    key={time + idx}
                                    variant={idx === 0 ? "default" : "secondary"}
                                    className="text-[10px]"
                                  >
                                    {time}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Toggle full schedule */}
                          <button
                            onClick={() => setExpandedSchedule(isExpanded ? null : route.id)}
                            className="text-[10px] text-primary hover:underline flex items-center gap-1"
                          >
                            {isExpanded 
                              ? (language === 'vi' ? 'Ẩn lịch trình' : 'Hide schedule')
                              : (language === 'vi' ? 'Xem đầy đủ lịch trình' : 'View full schedule')
                            }
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {/* Full schedule */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="bg-muted/30 rounded-lg p-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-[10px] font-medium text-muted-foreground mb-1">
                                        {language === 'vi' ? 'Ngày thường' : 'Weekday'}
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {route.schedule.weekday.map((s, idx) => (
                                          <span key={idx} className="text-[9px] bg-muted px-1 rounded">
                                            {s.departureTime}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-medium text-muted-foreground mb-1">
                                        {language === 'vi' ? 'Cuối tuần' : 'Weekend'}
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {route.schedule.weekend.map((s, idx) => (
                                          <span key={idx} className="text-[9px] bg-muted px-1 rounded">
                                            {s.departureTime}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
};
