import { useState, useEffect, useCallback, useRef } from 'react';
import { RouteStep } from './useDirections';

interface RealtimeNavigationState {
  userPosition: [number, number] | null;
  currentStepIndex: number;
  distanceToNextStep: number;
  isOffRoute: boolean;
  heading: number | null;
  accuracy: number | null;
  isTracking: boolean;
}

interface UseRealtimeNavigationProps {
  steps: RouteStep[];
  routeGeometry: GeoJSON.LineString | null;
  isNavigating: boolean;
  onOffRoute?: () => void;
}

// Calculate distance between two coordinates in meters (Haversine formula)
const calculateDistance = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Find closest point on route to user position
const findClosestPointOnRoute = (
  userPos: [number, number],
  coordinates: [number, number][]
): { distance: number; segmentIndex: number } => {
  let minDistance = Infinity;
  let closestSegmentIndex = 0;

  for (let i = 0; i < coordinates.length; i++) {
    const coord = coordinates[i];
    const distance = calculateDistance(
      userPos[1], userPos[0], // lat, lng
      coord[1], coord[0]
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestSegmentIndex = i;
    }
  }

  return { distance: minDistance, segmentIndex: closestSegmentIndex };
};

export const useRealtimeNavigation = ({
  steps,
  routeGeometry,
  isNavigating,
  onOffRoute,
}: UseRealtimeNavigationProps) => {
  const [state, setState] = useState<RealtimeNavigationState>({
    userPosition: null,
    currentStepIndex: 0,
    distanceToNextStep: 0,
    isOffRoute: false,
    heading: null,
    accuracy: null,
    isTracking: false,
  });

  const watchIdRef = useRef<number | null>(null);
  const offRouteThreshold = 50; // meters

  // Calculate current step based on user position and route progress
  const updateCurrentStep = useCallback((
    userPos: [number, number],
    routeCoords: [number, number][]
  ) => {
    const { distance, segmentIndex } = findClosestPointOnRoute(userPos, routeCoords);
    
    // Check if user is off route
    const isOffRoute = distance > offRouteThreshold;
    
    // Estimate current step based on progress along route
    let accumulatedDistance = 0;
    let estimatedStep = 0;
    
    for (let i = 0; i < steps.length; i++) {
      accumulatedDistance += steps[i].distance;
      const routeProgress = segmentIndex / routeCoords.length;
      const stepProgress = accumulatedDistance / steps.reduce((sum, s) => sum + s.distance, 0);
      
      if (routeProgress <= stepProgress) {
        estimatedStep = i;
        break;
      }
      estimatedStep = i;
    }

    // Calculate distance to next step waypoint
    let distanceToNext = 0;
    if (estimatedStep < steps.length) {
      // Rough estimate: remaining distance in current step
      let distanceCovered = 0;
      for (let i = 0; i < estimatedStep; i++) {
        distanceCovered += steps[i].distance;
      }
      const totalStepDistance = steps[estimatedStep]?.distance || 0;
      const routeProgress = segmentIndex / routeCoords.length;
      const totalRouteDistance = steps.reduce((sum, s) => sum + s.distance, 0);
      const userDistanceAlongRoute = routeProgress * totalRouteDistance;
      distanceToNext = Math.max(0, (distanceCovered + totalStepDistance) - userDistanceAlongRoute);
    }

    return { 
      currentStepIndex: estimatedStep, 
      distanceToNextStep: distanceToNext,
      isOffRoute 
    };
  }, [steps, offRouteThreshold]);

  // Start tracking user position
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const userPos: [number, number] = [
          position.coords.longitude,
          position.coords.latitude
        ];

        let stepUpdate = {
          currentStepIndex: 0,
          distanceToNextStep: 0,
          isOffRoute: false,
        };

        if (routeGeometry && routeGeometry.coordinates.length > 0) {
          stepUpdate = updateCurrentStep(
            userPos,
            routeGeometry.coordinates as [number, number][]
          );
        }

        setState(prev => {
          const newState = {
            ...prev,
            userPosition: userPos,
            heading: position.coords.heading,
            accuracy: position.coords.accuracy,
            isTracking: true,
            ...stepUpdate,
          };

          // Trigger off-route callback if needed
          if (stepUpdate.isOffRoute && !prev.isOffRoute && onOffRoute) {
            onOffRoute();
          }

          return newState;
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setState(prev => ({ ...prev, isTracking: false }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );

    setState(prev => ({ ...prev, isTracking: true }));
  }, [routeGeometry, updateCurrentStep, onOffRoute]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState(prev => ({ ...prev, isTracking: false }));
  }, []);

  // Auto start/stop tracking based on navigation state
  useEffect(() => {
    if (isNavigating) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isNavigating, startTracking, stopTracking]);

  return {
    ...state,
    startTracking,
    stopTracking,
  };
};
