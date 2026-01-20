import { useState, useCallback } from 'react';
import { getMapboxToken } from '@/lib/mapboxToken';
import { Location } from '@/data/locations';

export type TransportMode = 'walking' | 'driving' | 'cycling' | 'bus';

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    modifier?: string;
  };
}

export interface RouteLeg {
  distance: number;
  duration: number;
  steps: RouteStep[];
  originName: string;
  destinationName: string;
}

export interface MultiStopRouteInfo {
  totalDistance: number;
  totalDuration: number;
  geometry: GeoJSON.LineString;
  legs: RouteLeg[];
  waypoints: Waypoint[];
}

export interface Waypoint {
  coordinates: [number, number];
  name: string;
  location?: Location;
}

export interface MultiStopState {
  origin: Waypoint | null;
  waypoints: Waypoint[];
  route: MultiStopRouteInfo | null;
  isLoading: boolean;
  error: string | null;
  transportMode: TransportMode;
}

export const useMultiStopDirections = () => {
  const [state, setState] = useState<MultiStopState>({
    origin: null,
    waypoints: [],
    route: null,
    isLoading: false,
    error: null,
    transportMode: 'walking',
  });

  const setTransportMode = useCallback((mode: TransportMode) => {
    setState(prev => ({ ...prev, transportMode: mode }));
  }, []);

  const addWaypoint = useCallback((waypoint: Waypoint) => {
    setState(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, waypoint],
    }));
  }, []);

  const removeWaypoint = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index),
    }));
  }, []);

  const reorderWaypoints = useCallback((fromIndex: number, toIndex: number) => {
    setState(prev => {
      const newWaypoints = [...prev.waypoints];
      const [removed] = newWaypoints.splice(fromIndex, 1);
      newWaypoints.splice(toIndex, 0, removed);
      return { ...prev, waypoints: newWaypoints };
    });
  }, []);

  const clearWaypoints = useCallback(() => {
    setState(prev => ({
      ...prev,
      waypoints: [],
      route: null,
    }));
  }, []);

  const getMultiStopDirections = useCallback(async (
    origin: Waypoint,
    waypoints: Waypoint[],
    mode: TransportMode = 'walking'
  ) => {
    if (waypoints.length === 0) return;

    setState(prev => ({
      ...prev,
      origin,
      waypoints,
      transportMode: mode,
      isLoading: true,
      error: null,
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

      const profile = mode === 'walking' ? 'walking' : mode === 'cycling' ? 'cycling' : 'driving';

      // Build coordinates string: origin + all waypoints
      const allPoints = [origin, ...waypoints];
      const coordsString = allPoints
        .map(p => `${p.coordinates[0]},${p.coordinates[1]}`)
        .join(';');

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordsString}?geometries=geojson&steps=true&overview=full&access_token=${token}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch directions');
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Parse legs
        const legs: RouteLeg[] = route.legs.map((leg: any, index: number) => {
          const steps: RouteStep[] = leg.steps?.map((step: any) => ({
            instruction: step.maneuver?.instruction || '',
            distance: step.distance,
            duration: step.duration,
            maneuver: {
              type: step.maneuver?.type || '',
              modifier: step.maneuver?.modifier,
            },
          })) || [];

          return {
            distance: leg.distance,
            duration: leg.duration,
            steps,
            originName: index === 0 ? origin.name : waypoints[index - 1].name,
            destinationName: waypoints[index].name,
          };
        });

        setState(prev => ({
          ...prev,
          route: {
            totalDistance: route.distance,
            totalDuration: route.duration,
            geometry: route.geometry,
            legs,
            waypoints: allPoints,
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

  const clearRoute = useCallback(() => {
    setState({
      origin: null,
      waypoints: [],
      route: null,
      isLoading: false,
      error: null,
      transportMode: state.transportMode,
    });
  }, [state.transportMode]);

  return {
    ...state,
    addWaypoint,
    removeWaypoint,
    reorderWaypoints,
    clearWaypoints,
    getMultiStopDirections,
    clearRoute,
    setTransportMode,
  };
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

export const formatDuration = (seconds: number, language: 'vi' | 'en' = 'vi'): string => {
  const minutes = Math.round(seconds / 60);
  const minLabel = language === 'vi' ? 'phút' : 'min';
  const hrLabel = language === 'vi' ? 'giờ' : 'hr';
  
  if (minutes < 60) {
    return `${minutes} ${minLabel}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} ${hrLabel} ${remainingMinutes} ${minLabel}`;
};
