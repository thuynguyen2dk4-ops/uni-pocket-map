import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// EBMS API endpoints (Ho Chi Minh City bus system)
const EBMS_BASE_URL = 'http://apicms.ebms.vn';

interface EBMSStop {
  StopId: number;
  Name: string;
  AddressNo: string;
  Street: string;
  Zone: string;
  Lat: number;
  Lng: number;
  Routes: string;
}

interface EBMSRoute {
  RouteId: number;
  RouteNo: string;
  RouteName: string;
  RouteVarId: number;
  RouteVarName: string;
  RouteVarShortName: string;
  StartStop: string;
  EndStop: string;
  Distance: number;
  Outbound: boolean;
  RunningTime: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    // Get stops in bounds
    if (action === 'stops-in-bounds') {
      const swLng = url.searchParams.get('swLng') || '106.6';
      const swLat = url.searchParams.get('swLat') || '10.7';
      const neLng = url.searchParams.get('neLng') || '106.8';
      const neLat = url.searchParams.get('neLat') || '10.9';
      
      console.log(`Fetching stops in bounds: ${swLng},${swLat} to ${neLng},${neLat}`);
      
      const response = await fetch(
        `${EBMS_BASE_URL}/businfo/getstopsinbounds/${swLng}/${swLat}/${neLng}/${neLat}`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (!response.ok) {
        throw new Error(`EBMS API error: ${response.status}`);
      }
      
      const stops: EBMSStop[] = await response.json();
      console.log(`Found ${stops.length} stops`);
      
      // Transform to our format
      const transformedStops = stops.map(stop => ({
        id: stop.StopId.toString(),
        name: stop.Name,
        nameEn: stop.Name, // EBMS doesn't have English names
        address: `${stop.AddressNo} ${stop.Street}`,
        zone: stop.Zone,
        coordinates: [stop.Lng, stop.Lat] as [number, number],
        routes: stop.Routes?.split(',').map(r => r.trim()) || [],
      }));
      
      return new Response(JSON.stringify({ stops: transformedStops }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get routes through a stop
    if (action === 'routes-through-stop') {
      const stopId = url.searchParams.get('stopId');
      if (!stopId) {
        return new Response(JSON.stringify({ error: 'stopId is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log(`Fetching routes through stop: ${stopId}`);
      
      const response = await fetch(
        `${EBMS_BASE_URL}/businfo/getroutesthroughstop/${stopId}`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (!response.ok) {
        throw new Error(`EBMS API error: ${response.status}`);
      }
      
      const routes: EBMSRoute[] = await response.json();
      console.log(`Found ${routes.length} routes`);
      
      // Transform to our format
      const transformedRoutes = routes.map(route => ({
        id: route.RouteId.toString(),
        number: route.RouteNo,
        name: route.RouteName,
        nameEn: route.RouteName,
        variantId: route.RouteVarId,
        variantName: route.RouteVarName,
        startStop: route.StartStop,
        endStop: route.EndStop,
        distance: route.Distance,
        runningTime: route.RunningTime,
        isOutbound: route.Outbound,
      }));
      
      return new Response(JSON.stringify({ routes: transformedRoutes }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get route path/geometry
    if (action === 'route-path') {
      const routeVarId = url.searchParams.get('routeVarId');
      if (!routeVarId) {
        return new Response(JSON.stringify({ error: 'routeVarId is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log(`Fetching route path: ${routeVarId}`);
      
      const response = await fetch(
        `${EBMS_BASE_URL}/businfo/getvars/${routeVarId}`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (!response.ok) {
        throw new Error(`EBMS API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return new Response(JSON.stringify({ path: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Find path between two points
    if (action === 'find-path') {
      const startLat = url.searchParams.get('startLat');
      const startLng = url.searchParams.get('startLng');
      const destLat = url.searchParams.get('destLat');
      const destLng = url.searchParams.get('destLng');
      const maxTrips = url.searchParams.get('maxTrips') || '2';
      
      if (!startLat || !startLng || !destLat || !destLng) {
        return new Response(JSON.stringify({ error: 'Start and destination coordinates are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log(`Finding path from ${startLat},${startLng} to ${destLat},${destLng}`);
      
      const response = await fetch(
        `${EBMS_BASE_URL}/pathfinding/getpathbystop/${startLat},${startLng}/${destLat},${destLng}/${maxTrips}`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (!response.ok) {
        throw new Error(`EBMS API error: ${response.status}`);
      }
      
      const paths = await response.json();
      console.log(`Found ${Array.isArray(paths) ? paths.length : 0} paths`);
      
      return new Response(JSON.stringify({ paths }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Default: return available actions
    return new Response(JSON.stringify({
      message: 'Bus Routes API',
      actions: [
        'stops-in-bounds - Get bus stops in a geographic area',
        'routes-through-stop - Get routes passing through a stop',
        'route-path - Get the path/geometry of a route',
        'find-path - Find bus route between two points',
      ],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      note: 'EBMS API may be unavailable or have changed. Falling back to demo data is recommended.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
