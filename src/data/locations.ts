export type LocationType = 'building' | 'food' | 'housing' | 'job';

export interface Department {
  name: string;
  floor: string;
  room?: string;
}

export interface Review {
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Location {
  id: string;
  name: string;
  nameVi: string;
  type: LocationType;
  lat: number;
  lng: number;
  description: string;
  address: string;
  image: string;
  isSponsored?: boolean;
  hasVoucher?: boolean;
  voucherText?: string;
  rating?: number;
  reviewCount?: number;
  openHours?: string;
  phone?: string;
  departments?: Department[];
  reviews?: Review[];
  tags?: string[];
}

// VNU Xuân Thủy Campus - Coordinates: 21.0380, 105.7820
export const VNU_CENTER = {
  lat: 21.0380,
  lng: 105.7820,
};

export const locations: Location[] = [
  // University Buildings
  {
    id: 'e5',
    name: 'Building E5',
    nameVi: 'Tòa nhà E5',
    type: 'building',
    lat: 21.0385,
    lng: 105.7825,
    description: 'Tòa nhà E5 - Khoa Quốc tế, Trường Đại học Quốc gia Hà Nội',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    departments: [
      { name: 'Văn phòng Khoa Quốc tế', floor: 'Tầng 3', room: '301' },
      { name: 'Phòng Đào tạo', floor: 'Tầng 2', room: '205' },
      { name: 'Phòng Hợp tác Quốc tế', floor: 'Tầng 3', room: '305' },
      { name: 'Thư viện Khoa', floor: 'Tầng 1', room: '102' },
    ],
    tags: ['Khoa Quốc tế', 'Văn phòng', 'Thư viện'],
  },
  {
    id: 'c1',
    name: 'Building C1',
    nameVi: 'Tòa nhà C1',
    type: 'building',
    lat: 21.0375,
    lng: 105.7815,
    description: 'Tòa nhà C1 - Giảng đường chính, Thư viện Trung tâm',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    departments: [
      { name: 'Thư viện Trung tâm', floor: 'Tầng 1-2' },
      { name: 'Phòng Hội thảo', floor: 'Tầng 5', room: '501' },
      { name: 'Trung tâm CNTT', floor: 'Tầng 3', room: '301' },
    ],
    tags: ['Thư viện', 'Giảng đường', 'CNTT'],
  },
  {
    id: 'd2',
    name: 'Building D2',
    nameVi: 'Tòa nhà D2',
    type: 'building',
    lat: 21.0390,
    lng: 105.7810,
    description: 'Tòa nhà D2 - Khoa Công nghệ Thông tin',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    departments: [
      { name: 'Văn phòng Khoa CNTT', floor: 'Tầng 4', room: '401' },
      { name: 'Phòng Lab AI', floor: 'Tầng 5', room: '502' },
      { name: 'Phòng Sinh viên', floor: 'Tầng 1', room: '101' },
    ],
    tags: ['CNTT', 'Lab', 'Nghiên cứu'],
  },
  {
    id: 'g2',
    name: 'Building G2',
    nameVi: 'Tòa nhà G2',
    type: 'building',
    lat: 21.0370,
    lng: 105.7830,
    description: 'Tòa nhà G2 - Khoa Kinh tế, Khoa Luật',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    departments: [
      { name: 'Văn phòng Khoa Kinh tế', floor: 'Tầng 2', room: '201' },
      { name: 'Văn phòng Khoa Luật', floor: 'Tầng 3', room: '301' },
      { name: 'Phòng Hội nghị', floor: 'Tầng 6', room: '601' },
    ],
    tags: ['Kinh tế', 'Luật', 'Hội nghị'],
  },
  
  // Cafes around campus
  {
    id: 'highlands-xuanthuy',
    name: 'Highlands Coffee',
    nameVi: 'Highlands Coffee Xuân Thủy',
    type: 'food',
    lat: 21.0365,
    lng: 105.7805,
    description: 'Chuỗi cà phê nổi tiếng với không gian rộng rãi, phù hợp học nhóm',
    address: '130 Xuân Thủy, Cầu Giấy',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    isSponsored: true,
    hasVoucher: true,
    voucherText: 'Giảm 20% cho sinh viên',
    rating: 4.3,
    reviewCount: 256,
    openHours: '07:00 - 22:30',
    phone: '024 3456 7890',
    reviews: [
      { author: 'Minh Anh', rating: 5, comment: 'Không gian đẹp, wifi mạnh!', date: '2024-01-15' },
      { author: 'Hoàng Nam', rating: 4, comment: 'Cà phê ngon, giá hơi cao', date: '2024-01-10' },
    ],
    tags: ['Cà phê', 'Study space', 'Wifi'],
  },
  {
    id: 'the-coffee-house',
    name: 'The Coffee House',
    nameVi: 'The Coffee House',
    type: 'food',
    lat: 21.0395,
    lng: 105.7835,
    description: 'Quán cà phê yên tĩnh với menu đa dạng, có phòng riêng cho nhóm',
    address: '158 Xuân Thủy, Cầu Giấy',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
    isSponsored: true,
    hasVoucher: true,
    voucherText: 'Mua 2 tặng 1',
    rating: 4.5,
    reviewCount: 189,
    openHours: '07:30 - 23:00',
    phone: '024 3456 7891',
    reviews: [
      { author: 'Thu Hà', rating: 5, comment: 'Bánh ngọt rất ngon!', date: '2024-01-18' },
      { author: 'Văn Đức', rating: 4, comment: 'Phục vụ tốt, không gian ổn', date: '2024-01-12' },
    ],
    tags: ['Cà phê', 'Bánh ngọt', 'Nhóm'],
  },
  {
    id: 'phuc-long',
    name: 'Phúc Long',
    nameVi: 'Phúc Long Coffee & Tea',
    type: 'food',
    lat: 21.0360,
    lng: 105.7840,
    description: 'Thương hiệu trà sữa và cà phê Việt Nam, giá sinh viên',
    address: '162 Xuân Thủy, Cầu Giấy',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800',
    rating: 4.4,
    reviewCount: 312,
    openHours: '07:00 - 22:00',
    phone: '024 3456 7892',
    reviews: [
      { author: 'Lan Anh', rating: 5, comment: 'Trà sữa best của em!', date: '2024-01-20' },
    ],
    tags: ['Trà sữa', 'Cà phê', 'Giá rẻ'],
  },
  {
    id: 'katinat',
    name: 'Katinat Saigon Kafe',
    nameVi: 'Katinat Saigon Kafe',
    type: 'food',
    lat: 21.0378,
    lng: 105.7798,
    description: 'Cà phê phong cách Sài Gòn, có nhiều góc chụp ảnh đẹp',
    address: '125 Xuân Thủy, Cầu Giấy',
    image: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=800',
    rating: 4.2,
    reviewCount: 145,
    openHours: '08:00 - 22:00',
    phone: '024 3456 7893',
    reviews: [
      { author: 'Quỳnh Chi', rating: 4, comment: 'View đẹp, đồ uống ổn', date: '2024-01-08' },
    ],
    tags: ['Cà phê', 'Sống ảo', 'Aesthetic'],
  },
  {
    id: 'aha-cafe',
    name: 'Aha Cafe',
    nameVi: 'Aha Cafe Xuân Thủy',
    type: 'food',
    lat: 21.0400,
    lng: 105.7818,
    description: 'Quán cà phê bình dân, giá rẻ, gần cổng trường',
    address: '150 Xuân Thủy, Cầu Giấy',
    image: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800',
    rating: 4.0,
    reviewCount: 98,
    openHours: '06:30 - 21:30',
    phone: '024 3456 7894',
    reviews: [
      { author: 'Đức Anh', rating: 4, comment: 'Giá sinh viên, vị ổn', date: '2024-01-05' },
    ],
    tags: ['Cà phê', 'Giá rẻ', 'Gần trường'],
  },
  
  // Housing
  {
    id: 'nha-tro-1',
    name: 'Nhà trọ Sinh Viên',
    nameVi: 'Nhà trọ Sinh Viên Xuân Thủy',
    type: 'housing',
    lat: 21.0355,
    lng: 105.7850,
    description: 'Nhà trọ sạch sẽ, an ninh tốt, gần trường. Giá từ 1.5tr/tháng',
    address: '170 Xuân Thủy, Cầu Giấy',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    isSponsored: true,
    hasVoucher: true,
    voucherText: 'Giảm 500k tháng đầu',
    rating: 4.1,
    reviewCount: 45,
    phone: '0912 345 678',
    tags: ['Nhà trọ', 'An ninh', 'Giá rẻ'],
  },
  
  // Jobs
  {
    id: 'job-1',
    name: 'Tuyển Part-time',
    nameVi: 'Circle K - Tuyển Part-time',
    type: 'job',
    lat: 21.0372,
    lng: 105.7795,
    description: 'Circle K tuyển nhân viên part-time ca tối. Lương 25k/h + tips',
    address: '120 Xuân Thủy, Cầu Giấy',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    openHours: 'Ca 18:00 - 23:00',
    phone: '0987 654 321',
    tags: ['Part-time', 'Bán hàng', 'Tối'],
  },
];

export const getLocationsByType = (type: LocationType): Location[] => {
  return locations.filter(loc => loc.type === type);
};

export const searchLocations = (query: string): Location[] => {
  const lowerQuery = query.toLowerCase();
  return locations.filter(loc => {
    // Search in name
    if (loc.name.toLowerCase().includes(lowerQuery)) return true;
    if (loc.nameVi.toLowerCase().includes(lowerQuery)) return true;
    
    // Search in departments
    if (loc.departments) {
      return loc.departments.some(dept => 
        dept.name.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Search in tags
    if (loc.tags) {
      return loc.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
    }
    
    return false;
  });
};

export const findDepartment = (query: string): { location: Location; department: Department } | null => {
  const lowerQuery = query.toLowerCase();
  
  for (const location of locations) {
    if (location.departments) {
      const dept = location.departments.find(d => 
        d.name.toLowerCase().includes(lowerQuery)
      );
      if (dept) {
        return { location, department: dept };
      }
    }
  }
  
  return null;
};
