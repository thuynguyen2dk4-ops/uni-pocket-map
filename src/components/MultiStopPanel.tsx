import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useState, memo } from 'react';
import { 
  X, Navigation, Clock, Route, Footprints, Bike, Car,
  ChevronDown, ChevronUp, Plus, Trash2, GripVertical
} from 'lucide-react';
import { MultiStopRouteInfo, TransportMode, formatDistance, formatDuration, Waypoint } from '@/hooks/useMultiStopDirections';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';

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

// Bọc memo để tránh re-render khi user di chuyển bản đồ
export const MultiStopPanel = memo(({
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
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const draggableWaypoints = routeInfo?.waypoints.slice(1) || [];

  const transportModes: { mode: TransportMode; icon: any }[] = [
    { mode: 'walking', icon: Footprints },
    { mode: 'cycling', icon: Bike },
    { mode: 'driving', icon: Car },
  ];

  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="absolute top-16 left-3 right-3 z-30"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-card shadow-lg border border-border rounded-full"
        >
          <Route className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-medium">{waypoints.length} {language === 'vi' ? 'điểm' : 'stops'}</span>
          <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="absolute top-16 left-3 right-3 z-30"
    >
      {/* TỐI ƯU: Đã bỏ backdrop-blur-sm để hạ nhiệt GPU */}
      <div className="bg-card rounded-xl shadow-xl border border-border p-2">
        <div className="flex items-center gap-2 mb-2">
          <Route className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <span className="text-xs font-medium text-foreground">{waypoints.length} {language === 'vi' ? 'điểm' : 'stops'}</span>
          
          <div className="flex bg-muted/50 rounded-md p-0.5">
            {transportModes.map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => onChangeTransportMode(mode)}
                className={cn(
                  "p-1 rounded transition-colors",
                  transportMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3 h-3" />
              </button>
            ))}
          </div>
          
          {routeInfo && (
            <span className="text-xs font-bold text-purple-600 ml-1">{formatDistance(routeInfo.totalDistance)}</span>
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

        <ScrollArea className="max-h-28 mb-2">
          <div className="space-y-1">
            {routeInfo?.waypoints[0] && (
              <div className="flex items-center gap-1.5 p-1 bg-muted/30 rounded-lg">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[8px]">●</div>
                <span className="text-[10px] text-foreground truncate flex-1">{routeInfo.waypoints[0].name}</span>
              </div>
            )}
            
            <Reorder.Group axis="y" values={draggableWaypoints} onReorder={onReorderWaypoints} className="space-y-1">
              {draggableWaypoints.map((waypoint, index) => (
                <Reorder.Item
                  key={waypoint.id || `${waypoint.name}-${index}`}
                  value={waypoint}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                  whileDrag={{ backgroundColor: "var(--muted)", scale: 1.01 }}
                >
                  <div className={cn(
                    "flex items-center gap-1.5 p-1 rounded-lg transition-colors",
                    isDragging ? "bg-muted" : "bg-muted/30"
                  )}>
                    <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0 cursor-grab" />
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[8px] font-bold">
                      {index + 1}
                    </div>
                    <span className="text-[10px] text-foreground truncate flex-1">{waypoint.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveWaypoint(index); }}
                      className="w-4 h-4 hover:bg-destructive/20 rounded flex items-center justify-center"
                    >
                      <Trash2 className="w-2.5 h-2.5 text-destructive" />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2">
          <Button
            onClick={onAddStop}
            variant="outline"
            size="sm"
            className="h-7 text-[10px] border-dashed flex-1"
            disabled={isAddingStop}
          >
            <Plus className="w-3 h-3 mr-1" />
            {isAddingStop ? (language === 'vi' ? 'Đang chọn...' : 'Selecting...') : (language === 'vi' ? 'Thêm điểm dừng' : 'Add stop')}
          </Button>
          {isLoading && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>}
        </div>
      </div>
    </motion.div>
  );
}); // Chốt ngoặc ở đây là hết lỗi syntax!