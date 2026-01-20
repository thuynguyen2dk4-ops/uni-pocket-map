// Demo bus routes data for campus area

export interface BusStop {
  id: string;
  name: string;
  nameEn: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface BusSchedule {
  departureTime: string; // HH:mm format
  notes?: string;
}

export interface BusRoute {
  id: string;
  number: string;
  name: string;
  nameEn: string;
  color: string;
  stops: BusStop[];
  schedule: {
    weekday: BusSchedule[];
    weekend: BusSchedule[];
  };
  frequency: {
    weekday: string; // e.g., "10-15 phút"
    weekend: string;
  };
  operatingHours: {
    start: string;
    end: string;
  };
  fare: number; // VND
}

// Demo bus stops around a typical campus area
const busStops: Record<string, BusStop> = {
  mainGate: {
    id: 'main-gate',
    name: 'Cổng chính ĐH',
    nameEn: 'Main University Gate',
    coordinates: [106.6580, 10.7620],
  },
  adminBuilding: {
    id: 'admin-building',
    name: 'Tòa Hành chính',
    nameEn: 'Administration Building',
    coordinates: [106.6590, 10.7630],
  },
  library: {
    id: 'library',
    name: 'Thư viện',
    nameEn: 'Library',
    coordinates: [106.6600, 10.7640],
  },
  dormitory: {
    id: 'dormitory',
    name: 'Ký túc xá',
    nameEn: 'Dormitory',
    coordinates: [106.6610, 10.7650],
  },
  sportsCenter: {
    id: 'sports-center',
    name: 'Trung tâm Thể thao',
    nameEn: 'Sports Center',
    coordinates: [106.6620, 10.7660],
  },
  foodCourt: {
    id: 'food-court',
    name: 'Khu ẩm thực',
    nameEn: 'Food Court',
    coordinates: [106.6605, 10.7625],
  },
  busStation: {
    id: 'bus-station',
    name: 'Bến xe buýt',
    nameEn: 'Bus Station',
    coordinates: [106.6570, 10.7610],
  },
  hospital: {
    id: 'hospital',
    name: 'Bệnh viện',
    nameEn: 'Hospital',
    coordinates: [106.6550, 10.7600],
  },
  supermarket: {
    id: 'supermarket',
    name: 'Siêu thị',
    nameEn: 'Supermarket',
    coordinates: [106.6540, 10.7590],
  },
  techPark: {
    id: 'tech-park',
    name: 'Khu Công nghệ',
    nameEn: 'Tech Park',
    coordinates: [106.6630, 10.7670],
  },
};

// Demo bus routes
export const busRoutes: BusRoute[] = [
  {
    id: 'route-01',
    number: '01',
    name: 'Tuyến Nội bộ - Vòng trong',
    nameEn: 'Internal Route - Inner Loop',
    color: '#22c55e', // green
    stops: [
      busStops.mainGate,
      busStops.adminBuilding,
      busStops.library,
      busStops.foodCourt,
      busStops.mainGate,
    ],
    schedule: {
      weekday: [
        { departureTime: '06:30' },
        { departureTime: '07:00' },
        { departureTime: '07:30' },
        { departureTime: '08:00' },
        { departureTime: '08:30' },
        { departureTime: '09:00' },
        { departureTime: '09:30' },
        { departureTime: '10:00' },
        { departureTime: '10:30' },
        { departureTime: '11:00' },
        { departureTime: '11:30' },
        { departureTime: '12:00' },
        { departureTime: '13:00' },
        { departureTime: '13:30' },
        { departureTime: '14:00' },
        { departureTime: '14:30' },
        { departureTime: '15:00' },
        { departureTime: '15:30' },
        { departureTime: '16:00' },
        { departureTime: '16:30' },
        { departureTime: '17:00' },
        { departureTime: '17:30' },
        { departureTime: '18:00' },
      ],
      weekend: [
        { departureTime: '07:00' },
        { departureTime: '08:00' },
        { departureTime: '09:00' },
        { departureTime: '10:00' },
        { departureTime: '11:00' },
        { departureTime: '14:00' },
        { departureTime: '15:00' },
        { departureTime: '16:00' },
        { departureTime: '17:00' },
      ],
    },
    frequency: {
      weekday: '15-30 phút',
      weekend: '60 phút',
    },
    operatingHours: {
      start: '06:30',
      end: '18:00',
    },
    fare: 0, // Free campus shuttle
  },
  {
    id: 'route-02',
    number: '02',
    name: 'Tuyến KTX - Cổng chính',
    nameEn: 'Dormitory - Main Gate Route',
    color: '#3b82f6', // blue
    stops: [
      busStops.dormitory,
      busStops.sportsCenter,
      busStops.library,
      busStops.adminBuilding,
      busStops.mainGate,
    ],
    schedule: {
      weekday: [
        { departureTime: '06:00' },
        { departureTime: '06:30' },
        { departureTime: '07:00' },
        { departureTime: '07:15' },
        { departureTime: '07:30' },
        { departureTime: '07:45' },
        { departureTime: '08:00' },
        { departureTime: '11:30' },
        { departureTime: '12:00' },
        { departureTime: '12:30' },
        { departureTime: '16:30' },
        { departureTime: '17:00' },
        { departureTime: '17:30' },
        { departureTime: '18:00' },
        { departureTime: '18:30' },
        { departureTime: '19:00' },
        { departureTime: '21:00' },
        { departureTime: '22:00' },
      ],
      weekend: [
        { departureTime: '07:00' },
        { departureTime: '09:00' },
        { departureTime: '11:00' },
        { departureTime: '14:00' },
        { departureTime: '17:00' },
        { departureTime: '20:00' },
      ],
    },
    frequency: {
      weekday: '15-30 phút (giờ cao điểm)',
      weekend: '2-3 giờ',
    },
    operatingHours: {
      start: '06:00',
      end: '22:00',
    },
    fare: 0,
  },
  {
    id: 'route-52',
    number: '52',
    name: 'Bến xe buýt - ĐH - Bệnh viện',
    nameEn: 'Bus Station - University - Hospital',
    color: '#f59e0b', // amber
    stops: [
      busStops.busStation,
      busStops.mainGate,
      busStops.adminBuilding,
      busStops.library,
      busStops.hospital,
    ],
    schedule: {
      weekday: [
        { departureTime: '05:30' },
        { departureTime: '06:00' },
        { departureTime: '06:30' },
        { departureTime: '07:00' },
        { departureTime: '07:30' },
        { departureTime: '08:00' },
        { departureTime: '08:30' },
        { departureTime: '09:00' },
        { departureTime: '09:30' },
        { departureTime: '10:00' },
        { departureTime: '10:30' },
        { departureTime: '11:00' },
        { departureTime: '11:30' },
        { departureTime: '12:00' },
        { departureTime: '12:30' },
        { departureTime: '13:00' },
        { departureTime: '13:30' },
        { departureTime: '14:00' },
        { departureTime: '14:30' },
        { departureTime: '15:00' },
        { departureTime: '15:30' },
        { departureTime: '16:00' },
        { departureTime: '16:30' },
        { departureTime: '17:00' },
        { departureTime: '17:30' },
        { departureTime: '18:00' },
        { departureTime: '18:30' },
        { departureTime: '19:00' },
        { departureTime: '19:30' },
        { departureTime: '20:00' },
        { departureTime: '20:30' },
        { departureTime: '21:00' },
      ],
      weekend: [
        { departureTime: '06:00' },
        { departureTime: '07:00' },
        { departureTime: '08:00' },
        { departureTime: '09:00' },
        { departureTime: '10:00' },
        { departureTime: '11:00' },
        { departureTime: '12:00' },
        { departureTime: '14:00' },
        { departureTime: '15:00' },
        { departureTime: '16:00' },
        { departureTime: '17:00' },
        { departureTime: '18:00' },
        { departureTime: '19:00' },
        { departureTime: '20:00' },
      ],
    },
    frequency: {
      weekday: '15-20 phút',
      weekend: '30-60 phút',
    },
    operatingHours: {
      start: '05:30',
      end: '21:00',
    },
    fare: 7000,
  },
  {
    id: 'route-150',
    number: '150',
    name: 'Siêu thị - ĐH - Khu Công nghệ',
    nameEn: 'Supermarket - University - Tech Park',
    color: '#8b5cf6', // purple
    stops: [
      busStops.supermarket,
      busStops.busStation,
      busStops.mainGate,
      busStops.library,
      busStops.dormitory,
      busStops.techPark,
    ],
    schedule: {
      weekday: [
        { departureTime: '06:00' },
        { departureTime: '06:45' },
        { departureTime: '07:30' },
        { departureTime: '08:15' },
        { departureTime: '09:00' },
        { departureTime: '10:00' },
        { departureTime: '11:00' },
        { departureTime: '12:00' },
        { departureTime: '13:00' },
        { departureTime: '14:00' },
        { departureTime: '15:00' },
        { departureTime: '16:00' },
        { departureTime: '16:45' },
        { departureTime: '17:30' },
        { departureTime: '18:15' },
        { departureTime: '19:00' },
        { departureTime: '20:00' },
      ],
      weekend: [
        { departureTime: '07:00' },
        { departureTime: '09:00' },
        { departureTime: '11:00' },
        { departureTime: '13:00' },
        { departureTime: '15:00' },
        { departureTime: '17:00' },
        { departureTime: '19:00' },
      ],
    },
    frequency: {
      weekday: '30-45 phút',
      weekend: '2 giờ',
    },
    operatingHours: {
      start: '06:00',
      end: '20:00',
    },
    fare: 7000,
  },
];

// Helper to get next departures
export const getNextDepartures = (route: BusRoute, count: number = 3): string[] => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  
  const schedule = isWeekend ? route.schedule.weekend : route.schedule.weekday;
  
  const upcomingDepartures = schedule
    .map(s => {
      const [hours, minutes] = s.departureTime.split(':').map(Number);
      return { time: s.departureTime, totalMinutes: hours * 60 + minutes };
    })
    .filter(s => s.totalMinutes > currentTime)
    .slice(0, count)
    .map(s => s.time);
  
  return upcomingDepartures;
};

// Helper to calculate wait time
export const getWaitTime = (departureTime: string): number => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [hours, minutes] = departureTime.split(':').map(Number);
  const departureMinutes = hours * 60 + minutes;
  
  return departureMinutes - currentMinutes;
};

// Helper to format fare
export const formatFare = (fare: number, language: 'vi' | 'en'): string => {
  if (fare === 0) {
    return language === 'vi' ? 'Miễn phí' : 'Free';
  }
  return new Intl.NumberFormat('vi-VN').format(fare) + 'đ';
};
