import { useState, useCallback } from 'react';
import { getMapboxToken } from '@/lib/mapboxToken';

export interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: GeoJSON.LineString;
}

export interface DirectionsState {
  origin: [number, number] | null;
  destination: [number, number] | null;
  route: RouteInfo | null;
  isLoading: boolean;
  error: string | null;
}

export const useDirections = () => {
  const [state, setState] = useState<DirectionsState>({
    origin: null,
    destination: null,
    route: null,
    isLoading: false,
    error: null,
  });

  const getDirections = useCallback(async (
    origin: [number, number],
    destination: [number, number]
  ) => {
    setState(prev => ({ 
      ...prev, 
      origin, 
      destination, 
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

      // Use walking profile with steps for better pedestrian routing
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&steps=true&overview=full&access_token=${token}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch directions');
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setState(prev => ({
          ...prev,
          route: {
            distance: route.distance,
            duration: route.duration,
            geometry: route.geometry,
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
    setState({
      origin: null,
      destination: null,
      route: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    getDirections,
    clearDirections,
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
