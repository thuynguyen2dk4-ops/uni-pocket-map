import { motion } from 'framer-motion';
import { X, Navigation, Clock, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistance, formatDuration, RouteInfo } from '@/hooks/useDirections';

interface DirectionsPanelProps {
  routeInfo: RouteInfo;
  destinationName: string;
  isLoading: boolean;
  onClose: () => void;
}

export const DirectionsPanel = ({
  routeInfo,
  destinationName,
  isLoading,
  onClose,
}: DirectionsPanelProps) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="absolute top-32 left-4 right-4 z-30"
    >
      <div className="bg-card rounded-2xl shadow-xl border border-border p-4">
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

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Đang tính toán tuyến đường...</span>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-xl">
              <Route className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary">{formatDistance(routeInfo.distance)}</span>
            </div>
            <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-xl">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{formatDuration(routeInfo.duration)}</span>
            </div>
            <div className="flex-1 text-right">
              <span className="text-xs text-muted-foreground">🚶 Đi bộ</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
