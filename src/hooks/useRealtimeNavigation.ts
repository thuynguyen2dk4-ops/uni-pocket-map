// src/hooks/useRealtimeNavigation.ts
import { useState, useEffect, useCallback } from 'react';
import { RouteStep } from './useDirections';

interface RealtimeNavigationState {
  currentStepIndex: number;
  distanceToNextStep: number;
  isOffRoute: boolean;
  isTracking: boolean;
}

interface UseRealtimeNavigationProps {
  steps: RouteStep[];
  routeGeometry: GeoJSON.LineString | null;
  isNavigating: boolean;
  userLocation: { lat: number; lng: number } | null; // Nhận vị trí từ cha
  onOffRoute?: () => void;
}

// Calculate distance between two coordinates in meters (Haversine formula)
const calculateDistance = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371000;
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
  userLocation,
  onOffRoute,
}: UseRealtimeNavigationProps) => {
  const [state, setState] = useState<RealtimeNavigationState>({
    currentStepIndex: 0,
    distanceToNextStep: 0,
    isOffRoute: false,
    isTracking: false,
  });

  const offRouteThreshold = 50; // meters

  // Logic tính toán bước đi
  const updateCurrentStep = useCallback((
    userPos: [number, number],
    routeCoords: [number, number][]
  ) => {
    const { distance, segmentIndex } = findClosestPointOnRoute(userPos, routeCoords);
    
    // Check if user is off route
    const isOffRoute = distance > offRouteThreshold;
    
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

    let distanceToNext = 0;
    if (estimatedStep < steps.length) {
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

  // Effect chạy mỗi khi userLocation thay đổi
  useEffect(() => {
    if (!isNavigating || !userLocation || !routeGeometry) {
      setState(prev => ({ ...prev, isTracking: false }));
      return;
    }

    const userPos: [number, number] = [userLocation.lng, userLocation.lat];
    const stepUpdate = updateCurrentStep(userPos, routeGeometry.coordinates as [number, number][]);

    setState(prev => {
        const newState = {
            ...prev,
            isTracking: true,
            ...stepUpdate,
        };
        // Trigger off-route callback
        if (stepUpdate.isOffRoute && !prev.isOffRoute && onOffRoute) {
            onOffRoute();
        }
        return newState;
    });

  }, [isNavigating, userLocation, routeGeometry, updateCurrentStep, onOffRoute]);

  return state;
};