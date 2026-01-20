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
  // ========== KHU A ==========
  {
    id: 'a1',
    name: 'Building A1',
    nameVi: 'Tòa nhà A1',
    type: 'building',
    lat: 21.039716,
    lng: 105.783208,
    description: 'Tòa nhà A1 - Khu hành chính, Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Hành chính', 'Giảng đường'],
  },
  {
    id: 'a2',
    name: 'Building A2',
    nameVi: 'Tòa nhà A2',
    type: 'building',
    lat: 21.039241,
    lng: 105.783088,
    description: 'Tòa nhà A2 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'a3',
    name: 'Building A3',
    nameVi: 'Tòa nhà A3',
    type: 'building',
    lat: 21.039111,
    lng: 105.782790,
    description: 'Tòa nhà A3 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'a4',
    name: 'Building A4',
    nameVi: 'Tòa nhà A4',
    type: 'building',
    lat: 21.039805,
    lng: 105.782784,
    description: 'Tòa nhà A4 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'a5',
    name: 'Building A5',
    nameVi: 'Tòa nhà A5',
    type: 'building',
    lat: 21.039853,
    lng: 105.782960,
    description: 'Tòa nhà A5 - Văn phòng Khoa',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Văn phòng'],
  },
  {
    id: 'a6',
    name: 'Building A6',
    nameVi: 'Tòa nhà A6',
    type: 'building',
    lat: 21.040221,
    lng: 105.782938,
    description: 'Tòa nhà A6 - Văn phòng Khoa',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Văn phòng'],
  },
  {
    id: 'a7',
    name: 'Building A7',
    nameVi: 'Tòa nhà A7',
    type: 'building',
    lat: 21.039954,
    lng: 105.781578,
    description: 'Tòa nhà A7 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    tags: ['Giảng đường'],
  },

  // ========== KHU B ==========
  {
    id: 'b1',
    name: 'Building B1',
    nameVi: 'Tòa nhà B1',
    type: 'building',
    lat: 21.038068,
    lng: 105.781223,
    description: 'Tòa nhà B1 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'b2',
    name: 'Building B2',
    nameVi: 'Tòa nhà B2',
    type: 'building',
    lat: 21.037537,
    lng: 105.782431,
    description: 'Tòa nhà B2 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'b3',
    name: 'Building B3',
    nameVi: 'Tòa nhà B3',
    type: 'building',
    lat: 21.038429,
    lng: 105.782022,
    description: 'Tòa nhà B3 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'b4',
    name: 'Building B4',
    nameVi: 'Tòa nhà B4',
    type: 'building',
    lat: 21.036848,
    lng: 105.782781,
    description: 'Tòa nhà B4 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    tags: ['Giảng đường'],
  },

  // ========== KHU C ==========
  {
    id: 'c1',
    name: 'Building C1',
    nameVi: 'Tòa nhà C1',
    type: 'building',
    lat: 21.039312,
    lng: 105.781655,
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
    id: 'c1t',
    name: 'Building C1T',
    nameVi: 'Tòa nhà C1T',
    type: 'building',
    lat: 21.038379,
    lng: 105.783359,
    description: 'Tòa nhà C1T - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'c2',
    name: 'Building C2',
    nameVi: 'Tòa nhà C2',
    type: 'building',
    lat: 21.038700,
    lng: 105.781617,
    description: 'Tòa nhà C2 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'c3',
    name: 'Building C3',
    nameVi: 'Tòa nhà C3',
    type: 'building',
    lat: 21.038979,
    lng: 105.782013,
    description: 'Tòa nhà C3 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'c4',
    name: 'Building C4',
    nameVi: 'Tòa nhà C4',
    type: 'building',
    lat: 21.038673,
    lng: 105.782202,
    description: 'Tòa nhà C4 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'c5',
    name: 'Building C5',
    nameVi: 'Tòa nhà C5',
    type: 'building',
    lat: 21.039211,
    lng: 105.782236,
    description: 'Tòa nhà C5 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'c6',
    name: 'Building C6',
    nameVi: 'Tòa nhà C6',
    type: 'building',
    lat: 21.038969,
    lng: 105.781364,
    description: 'Tòa nhà C6 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },

  // ========== KHU D ==========
  {
    id: 'd1',
    name: 'Building D1',
    nameVi: 'Tòa nhà D1',
    type: 'building',
    lat: 21.037450,
    lng: 105.781428,
    description: 'Tòa nhà D1 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'd2',
    name: 'Building D2',
    nameVi: 'Tòa nhà D2',
    type: 'building',
    lat: 21.037666,
    lng: 105.781625,
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

  // ========== KHU E ==========
  {
    id: 'e1',
    name: 'Building E1',
    nameVi: 'Tòa nhà E1',
    type: 'building',
    lat: 21.037898,
    lng: 105.782659,
    description: 'Tòa nhà E1 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'e2',
    name: 'Building E2',
    nameVi: 'Tòa nhà E2',
    type: 'building',
    lat: 21.038138,
    lng: 105.782504,
    description: 'Tòa nhà E2 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'e3',
    name: 'Building E3',
    nameVi: 'Tòa nhà E3',
    type: 'building',
    lat: 21.038251,
    lng: 105.782673,
    description: 'Tòa nhà E3 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'e4',
    name: 'Building E4',
    nameVi: 'Tòa nhà E4',
    type: 'building',
    lat: 21.038066,
    lng: 105.782863,
    description: 'Tòa nhà E4 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'e5',
    name: 'Building E5',
    nameVi: 'Tòa nhà E5',
    type: 'building',
    lat: 21.038406,
    lng: 105.782762,
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

  // ========== KHU G ==========
  {
    id: 'g2',
    name: 'Building G2',
    nameVi: 'Tòa nhà G2',
    type: 'building',
    lat: 21.038066,
    lng: 105.783356,
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
  {
    id: 'g3',
    name: 'Building G3',
    nameVi: 'Tòa nhà G3',
    type: 'building',
    lat: 21.038096,
    lng: 105.781995,
    description: 'Tòa nhà G3 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'g4',
    name: 'Building G4',
    nameVi: 'Tòa nhà G4',
    type: 'building',
    lat: 21.037036,
    lng: 105.782326,
    description: 'Tòa nhà G4 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'g5',
    name: 'Building G5',
    nameVi: 'Tòa nhà G5',
    type: 'building',
    lat: 21.037865,
    lng: 105.781460,
    description: 'Tòa nhà G5 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'g6',
    name: 'Building G6',
    nameVi: 'Tòa nhà G6',
    type: 'building',
    lat: 21.037614,
    lng: 105.781167,
    description: 'Tòa nhà G6 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'g7',
    name: 'Building G7',
    nameVi: 'Tòa nhà G7',
    type: 'building',
    lat: 21.038435,
    lng: 105.781448,
    description: 'Tòa nhà G7 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'g8',
    name: 'Building G8',
    nameVi: 'Tòa nhà G8',
    type: 'building',
    lat: 21.038258,
    lng: 105.781445,
    description: 'Tòa nhà G8 - Giảng đường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Giảng đường'],
  },

  // ========== KÝ TÚC XÁ (Khu 14) ==========
  {
    id: '14a',
    name: 'Dormitory 14A',
    nameVi: 'Ký túc xá 14A',
    type: 'building',
    lat: 21.040668,
    lng: 105.782163,
    description: 'Ký túc xá 14A - Dành cho sinh viên',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    tags: ['Ký túc xá', 'Sinh viên'],
  },
  {
    id: '14b',
    name: 'Dormitory 14B',
    nameVi: 'Ký túc xá 14B',
    type: 'building',
    lat: 21.040332,
    lng: 105.782139,
    description: 'Ký túc xá 14B - Dành cho sinh viên',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    tags: ['Ký túc xá', 'Sinh viên'],
  },
  {
    id: '14c',
    name: 'Dormitory 14C',
    nameVi: 'Ký túc xá 14C',
    type: 'building',
    lat: 21.040741,
    lng: 105.781459,
    description: 'Ký túc xá 14C - Dành cho sinh viên',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    tags: ['Ký túc xá', 'Sinh viên'],
  },
  {
    id: '14d',
    name: 'Dormitory 14D',
    nameVi: 'Ký túc xá 14D',
    type: 'building',
    lat: 21.040696,
    lng: 105.783074,
    description: 'Ký túc xá 14D - Dành cho sinh viên',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    tags: ['Ký túc xá', 'Sinh viên'],
  },

  // ========== TIỆN ÍCH ==========
  {
    id: 'y1',
    name: 'Y1 Building',
    nameVi: 'Tòa nhà Y1',
    type: 'building',
    lat: 21.040338,
    lng: 105.781607,
    description: 'Tòa nhà Y1 - Trạm Y tế',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    tags: ['Y tế', 'Sức khỏe'],
  },
  {
    id: 'san-the-chat',
    name: 'Sports Ground',
    nameVi: 'Sân Thể Chất',
    type: 'building',
    lat: 21.039959,
    lng: 105.781870,
    description: 'Sân thể chất - Khu vực thể thao ngoài trời',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1461896836934- voices-from-the-sports-field?w=800',
    tags: ['Thể thao', 'Sân bóng'],
  },
  {
    id: 'sunwah',
    name: 'Sunwah Building',
    nameVi: 'Tòa nhà Sunwah',
    type: 'building',
    lat: 21.037354,
    lng: 105.782269,
    description: 'Tòa nhà Sunwah - Trung tâm Đổi mới Sáng tạo',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    tags: ['Đổi mới', 'Sáng tạo', 'Startup'],
  },
  {
    id: 'mb-bank',
    name: 'MB Bank ATM',
    nameVi: 'Cây ATM MB Bank',
    type: 'building',
    lat: 21.038383,
    lng: 105.782522,
    description: 'Cây ATM MB Bank trong khuôn viên trường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    tags: ['ATM', 'Ngân hàng'],
  },
  {
    id: 'ho',
    name: 'Campus Lake',
    nameVi: 'Hồ trong khuôn viên',
    type: 'building',
    lat: 21.039027,
    lng: 105.781676,
    description: 'Hồ nước trong khuôn viên trường - Khu vực thư giãn',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    tags: ['Hồ', 'Thư giãn', 'Cảnh quan'],
  },
  {
    id: 'cong1',
    name: 'Main Gate (Xuan Thuy)',
    nameVi: 'Cổng chính (Xuân Thủy)',
    type: 'building',
    lat: 21.036791,
    lng: 105.782057,
    description: 'Cổng chính vào trường từ đường Xuân Thủy',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Cổng', 'Lối vào'],
  },
  {
    id: 'cong2',
    name: 'Side Gate (Pham Van Dong)',
    nameVi: 'Cổng phụ (Phạm Văn Đồng)',
    type: 'building',
    lat: 21.039644,
    lng: 105.781168,
    description: 'Cổng phụ vào trường từ đường Phạm Văn Đồng',
    address: 'Phạm Văn Đồng, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Cổng', 'Lối vào'],
  },

  // ========== QUÁN CÀ PHÊ ==========
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

  // ========== NHÀ TRỌ ==========
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

  // ========== VIỆC LÀM ==========
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
