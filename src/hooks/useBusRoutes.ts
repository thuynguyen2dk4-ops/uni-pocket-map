import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BusRoute, BusStop, busRoutes as demoRoutes } from '@/data/busRoutes';

export interface RealBusStop {
  id: string;
  name: string;
  nameEn: string;
  address: string;
  zone: string;
  coordinates: [number, number];
  routes: string[];
}

export interface RealBusRoute {
  id: string;
  number: string;
  name: string;
  nameEn: string;
  variantId: number;
  variantName: string;
  startStop: string;
  endStop: string;
  distance: number;
  runningTime: number;
  isOutbound: boolean;
}

export interface BusPath {
  // Structure depends on EBMS response
  routes: any[];
  totalDistance: number;
  totalTime: number;
}

export const useBusRoutes = () => {
  const [stops, setStops] = useState<RealBusStop[]>([]);
  const [routes, setRoutes] = useState<RealBusRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDemoData, setUseDemoData] = useState(true);

  // Fetch stops in a geographic bounds
  const fetchStopsInBounds = useCallback(async (
    swLng: number, swLat: number, 
    neLng: number, neLat: number
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('bus-routes', {
        body: null,
        headers: {},
      });
      
      // Use query params approach via URL
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bus-routes?action=stops-in-bounds&swLng=${swLng}&swLat=${swLat}&neLng=${neLng}&neLat=${neLat}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch bus stops');
      }
      
      const result = await response.json();
      
      if (result.stops && result.stops.length > 0) {
        setStops(result.stops);
        setUseDemoData(false);
      } else {
        console.log('No stops found, using demo data');
        setUseDemoData(true);
      }
    } catch (err) {
      console.error('Error fetching bus stops:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setUseDemoData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch routes through a stop
  const fetchRoutesForStop = useCallback(async (stopId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bus-routes?action=routes-through-stop&stopId=${stopId}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch routes');
      }
      
      const result = await response.json();
      
      if (result.routes) {
        setRoutes(result.routes);
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Find bus path between two points
  const findBusPath = useCallback(async (
    startLat: number, startLng: number,
    destLat: number, destLng: number,
    maxTrips: number = 2
  ): Promise<BusPath | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bus-routes?action=find-path&startLat=${startLat}&startLng=${startLng}&destLat=${destLat}&destLng=${destLng}&maxTrips=${maxTrips}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to find bus path');
      }
      
      const result = await response.json();
      return result.paths;
    } catch (err) {
      console.error('Error finding bus path:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get demo routes (fallback)
  const getDemoRoutes = useCallback((): BusRoute[] => {
    return demoRoutes;
  }, []);

  return {
    stops,
    routes,
    isLoading,
    error,
    useDemoData,
    fetchStopsInBounds,
    fetchRoutesForStop,
    findBusPath,
    getDemoRoutes,
  };
};
