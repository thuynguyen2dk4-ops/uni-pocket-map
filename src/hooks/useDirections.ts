import { useState, useCallback } from 'react';
import { getMapboxToken } from '@/lib/mapboxToken';

export type TransportMode = 'walking' | 'driving' | 'cycling';

export interface RouteStep {
  instruction: string;
  distance: number; // in meters
  duration: number; // in seconds
  maneuver: {
    type: string;
    modifier?: string;
  };
}

export interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: GeoJSON.LineString;
  steps: RouteStep[];
}

export interface DirectionsState {
  origin: [number, number] | null;
  destination: [number, number] | null;
  route: RouteInfo | null;
  isLoading: boolean;
  error: string | null;
  transportMode: TransportMode;
}

export const useDirections = () => {
  const [state, setState] = useState<DirectionsState>({
    origin: null,
    destination: null,
    route: null,
    isLoading: false,
    error: null,
    transportMode: 'walking',
  });

  const setTransportMode = useCallback((mode: TransportMode) => {
    setState(prev => ({ ...prev, transportMode: mode }));
  }, []);

  const getDirections = useCallback(async (
    origin: [number, number],
    destination: [number, number],
    mode: TransportMode = 'walking'
  ) => {
    setState(prev => ({ 
      ...prev, 
      origin, 
      destination, 
      transportMode: mode,
      isLoading: true, 
      error: null 
    }));

    try {
      const token = getMapboxToken();
      if (!token) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Mapbox Token chưa được cấu hình',
        }));
        return;
      }

      // Map transport mode to Mapbox profile
      // Note: Mapbox doesn't have a motorcycle profile, use driving for both motorcycle and car
      const profile = mode === 'walking' ? 'walking' : mode === 'cycling' ? 'cycling' : 'driving';

      // Request alternatives and pick shortest route
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&steps=true&overview=full&alternatives=true&access_token=${token}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch directions');
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        // Sort routes by distance and pick the shortest one
        const sortedRoutes = [...data.routes].sort((a: any, b: any) => a.distance - b.distance);
        const route = sortedRoutes[0];
        
        // Extract steps from legs
        const steps: RouteStep[] = [];
        if (route.legs && route.legs.length > 0) {
          route.legs.forEach((leg: any) => {
            if (leg.steps) {
              leg.steps.forEach((step: any) => {
                steps.push({
                  instruction: step.maneuver?.instruction || '',
                  distance: step.distance,
                  duration: step.duration,
                  maneuver: {
                    type: step.maneuver?.type || '',
                    modifier: step.maneuver?.modifier,
                  },
                });
              });
            }
          });
        }

        setState(prev => ({
          ...prev,
          route: {
            distance: route.distance,
            duration: route.duration,
            geometry: route.geometry,
            steps,
          },
          isLoading: false,
        }));
      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      }));
    }
  }, []);

  const clearDirections = useCallback(() => {
    setState(prev => ({
      origin: null,
      destination: null,
      route: null,
      isLoading: false,
      error: null,
      transportMode: prev.transportMode,
    }));
  }, []);

  return {
    ...state,
    getDirections,
    clearDirections,
    setTransportMode,
  };
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} giờ ${remainingMinutes} phút`;
};
