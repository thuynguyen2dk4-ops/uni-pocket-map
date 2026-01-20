export type LocationType = 'building' | 'food' | 'housing' | 'job';

export interface Department {
  name: string;
  nameEn?: string;
  floor: string;
  floorEn?: string;
  room?: string;
}

export interface Review {
  author: string;
  rating: number;
  comment: string;
  commentEn?: string;
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
  descriptionEn?: string;
  address: string;
  addressEn?: string;
  image: string;
  isSponsored?: boolean;
  hasVoucher?: boolean;
  voucherText?: string;
  voucherTextKey?: string; // Translation key for voucher
  rating?: number;
  reviewCount?: number;
  openHours?: string;
  openHoursEn?: string;
  phone?: string;
  departments?: Department[];
  reviews?: Review[];
  tags?: string[];
  tagsEn?: string[];
}

// VNU Xuân Thủy Campus - Coordinates: 21.0380, 105.7820
export const VNU_CENTER = {
  lat: 21.0380,
  lng: 105.7820,
};

export const locations: Location[] = [
  // ========== KHU A ==========
  {
    id: 'A1',
    name: 'A1',
    nameVi: 'A1',
    type: 'building',
    lat: 21.039716029400708,
    lng: 105.7832080286106,
    description: 'Tòa nhà A1',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'A2',
    name: 'A2',
    nameVi: 'A2',
    type: 'building',
    lat: 21.039241956752605,
    lng: 105.78308893318581,
    description: 'Tòa nhà A2',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'A3',
    name: 'A3',
    nameVi: 'A3',
    type: 'building',
    lat: 21.039111478563356,
    lng: 105.78279039415679,
    description: 'Tòa nhà A3',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'A4',
    name: 'A4',
    nameVi: 'A4',
    type: 'building',
    lat: 21.039805,
    lng: 105.782784,
    description: 'Tòa nhà A4',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'A5',
    name: 'A5',
    nameVi: 'A5',
    type: 'building',
    lat: 21.039853372191985,
    lng: 105.78296008714364,
    description: 'Tòa nhà A5',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'A6',
    name: 'A6',
    nameVi: 'A6',
    type: 'building',
    lat: 21.040221833014513,
    lng: 105.78293897060121,
    description: 'Tòa nhà A6',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'A7',
    name: 'A7',
    nameVi: 'A7',
    type: 'building',
    lat: 21.039954182925683,
    lng: 105.78157815521064,
    description: 'Tòa nhà A7',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'A8',
    name: 'A8',
    nameVi: 'A8',
    type: 'building',
    lat: 21.040014,
    lng: 105.781236,
    description: 'Tòa nhà A8',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },

  // ========== KHU B ==========
  {
    id: 'B1',
    name: 'B1',
    nameVi: 'B1',
    type: 'building',
    lat: 21.03806856546437,
    lng: 105.78122336937986,
    description: 'Tòa nhà B1',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'B2',
    name: 'B2',
    nameVi: 'B2',
    type: 'building',
    lat: 21.037537005578642,
    lng: 105.78243174427888,
    description: 'Tòa nhà B2',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'B3',
    name: 'B3',
    nameVi: 'B3',
    type: 'building',
    lat: 21.03842964478416,
    lng: 105.78202247538536,
    description: 'Tòa nhà B3',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'B4',
    name: 'B4',
    nameVi: 'B4',
    type: 'building',
    lat: 21.036848509166973,
    lng: 105.78278135131,
    description: 'Tòa nhà B4',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    tags: ['Giảng đường'],
  },

  // ========== KHU C ==========
  {
    id: 'C1',
    name: 'C1',
    nameVi: 'C1',
    type: 'building',
    lat: 21.039312040918517,
    lng: 105.7816554858685,
    description: 'Tòa nhà C1',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'C1T',
    name: 'C1T',
    nameVi: 'C1T',
    type: 'building',
    lat: 21.03837975944799,
    lng: 105.78335962961887,
    description: 'Tòa nhà C1T',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'C2',
    name: 'C2',
    nameVi: 'C2',
    type: 'building',
    lat: 21.038700468933712,
    lng: 105.7816178053169,
    description: 'Tòa nhà C2',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'C3',
    name: 'C3',
    nameVi: 'C3',
    type: 'building',
    lat: 21.03897939011371,
    lng: 105.78201374266945,
    description: 'Tòa nhà C3',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'C4',
    name: 'C4',
    nameVi: 'C4',
    type: 'building',
    lat: 21.038673854494604,
    lng: 105.78220222457082,
    description: 'Tòa nhà C4',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'C5',
    name: 'C5',
    nameVi: 'C5',
    type: 'building',
    lat: 21.039211779923747,
    lng: 105.78223646566244,
    description: 'Tòa nhà C5',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'C6',
    name: 'C6',
    nameVi: 'C6',
    type: 'building',
    lat: 21.038969210374205,
    lng: 105.7813646272462,
    description: 'Tòa nhà C6',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },

  // ========== KHU D ==========
  {
    id: 'D1',
    name: 'Hội trường Nguyễn Văn Đạo',
    nameVi: 'Hội trường Nguyễn Văn Đạo',
    type: 'building',
    lat: 21.03745096834652,
    lng: 105.78142828118075,
    description: 'Hội trường Nguyễn Văn Đạo - Hội trường lớn',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Hội trường', 'Sự kiện'],
  },
  {
    id: 'D2',
    name: 'Nhà điều hành ĐHQG D2',
    nameVi: 'Nhà điều hành ĐHQG D2',
    type: 'building',
    lat: 21.03766686313898,
    lng: 105.78162505532134,
    description: 'Nhà điều hành ĐHQG - Tòa nhà D2',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    tags: ['Điều hành', 'Hành chính'],
  },

  // ========== KHU E ==========
  {
    id: 'E1',
    name: 'E1',
    nameVi: 'E1',
    type: 'building',
    lat: 21.037898547008368,
    lng: 105.78265983816675,
    description: 'Tòa nhà E1',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'E2',
    name: 'E2',
    nameVi: 'E2',
    type: 'building',
    lat: 21.038138125326725,
    lng: 105.78250452675343,
    description: 'Tòa nhà E2',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'E3',
    name: 'E3',
    nameVi: 'E3',
    type: 'building',
    lat: 21.038251539453896,
    lng: 105.78267346560932,
    description: 'Tòa nhà E3',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'E4',
    name: 'E4',
    nameVi: 'E4',
    type: 'building',
    lat: 21.038066515983516,
    lng: 105.7828634652073,
    description: 'Tòa nhà E4',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'E5',
    name: 'E5',
    nameVi: 'E5',
    type: 'building',
    lat: 21.03840666563933,
    lng: 105.7827621403332,
    description: 'Tòa nhà E5',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },

  // ========== KHU G ==========
  {
    id: 'G2',
    name: 'G2',
    nameVi: 'G2',
    type: 'building',
    lat: 21.038066718818,
    lng: 105.7833562104258,
    description: 'Tòa nhà G2',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'G3',
    name: 'G3',
    nameVi: 'G3',
    type: 'building',
    lat: 21.038096961578148,
    lng: 105.78199566240357,
    description: 'Tòa nhà G3',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'G4',
    name: 'G4',
    nameVi: 'G4',
    type: 'building',
    lat: 21.037036202500104,
    lng: 105.7823262311631,
    description: 'Tòa nhà G4',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'G5',
    name: 'G5',
    nameVi: 'G5',
    type: 'building',
    lat: 21.037865450192925,
    lng: 105.7814600713798,
    description: 'Tòa nhà G5',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'G6',
    name: 'G6',
    nameVi: 'G6',
    type: 'building',
    lat: 21.037614060236706,
    lng: 105.78116710074528,
    description: 'Tòa nhà G6',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'G7',
    name: 'G7',
    nameVi: 'G7',
    type: 'building',
    lat: 21.038435221135757,
    lng: 105.78144892714266,
    description: 'Tòa nhà G7',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Giảng đường'],
  },
  {
    id: 'G8',
    name: 'G8',
    nameVi: 'G8',
    type: 'building',
    lat: 21.038258438326096,
    lng: 105.78144555504053,
    description: 'Tòa nhà G8',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Giảng đường'],
  },

  // ========== KÝ TÚC XÁ (Khu 14) ==========
  {
    id: '14A',
    name: '14A',
    nameVi: '14A',
    type: 'building',
    lat: 21.04066869104366,
    lng: 105.78216346177845,
    description: 'Ký túc xá 14A',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    tags: ['Ký túc xá', 'Sinh viên'],
  },
  {
    id: '14B',
    name: '14B',
    nameVi: '14B',
    type: 'building',
    lat: 21.040332429257745,
    lng: 105.78213949275664,
    description: 'Ký túc xá 14B',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    tags: ['Ký túc xá', 'Sinh viên'],
  },
  {
    id: '14C',
    name: '14C',
    nameVi: '14C',
    type: 'building',
    lat: 21.04074140951343,
    lng: 105.78145868466765,
    description: 'Ký túc xá 14C',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    tags: ['Ký túc xá', 'Sinh viên'],
  },
  {
    id: '14D',
    name: '14D',
    nameVi: '14D',
    type: 'building',
    lat: 21.040696062046877,
    lng: 105.7830743587856,
    description: 'Ký túc xá 14D',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    tags: ['Ký túc xá', 'Sinh viên'],
  },

  // ========== TIỆN ÍCH ==========
  {
    id: 'Y1',
    name: 'Y1',
    nameVi: 'Y1',
    type: 'building',
    lat: 21.040337761272482,
    lng: 105.78160682814034,
    description: 'Tòa nhà Y1 - Trạm Y tế',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    tags: ['Y tế', 'Sức khỏe'],
  },
  {
    id: 'SANTHECHAT',
    name: 'Sân giáo dục thể chất',
    nameVi: 'Sân giáo dục thể chất',
    type: 'building',
    lat: 21.039932683929663,
    lng: 105.78187391466429,
    description: 'Sân giáo dục thể chất - Khu vực thể thao ngoài trời',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    tags: ['Thể thao', 'Sân bóng'],
  },
  {
    id: 'SUNWAH',
    name: 'Sunwah',
    nameVi: 'Sunwah',
    type: 'building',
    lat: 21.0373549,
    lng: 105.782269,
    description: 'Tòa nhà Sunwah - Trung tâm Đổi mới Sáng tạo',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    tags: ['Đổi mới', 'Sáng tạo', 'Startup'],
  },
  {
    id: 'MB',
    name: 'MB Bank',
    nameVi: 'MB Bank',
    type: 'building',
    lat: 21.038383769994525,
    lng: 105.78252247352702,
    description: 'Cây ATM MB Bank trong khuôn viên trường',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    tags: ['ATM', 'Ngân hàng'],
  },
  {
    id: 'HO',
    name: 'Hồ',
    nameVi: 'Hồ',
    type: 'building',
    lat: 21.039027854415934,
    lng: 105.78167624551548,
    description: 'Hồ nước trong khuôn viên trường - Khu vực thư giãn',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    tags: ['Hồ', 'Thư giãn', 'Cảnh quan'],
  },
  {
    id: 'CONG1',
    name: 'Cổng Xuân Thủy',
    nameVi: 'Cổng Xuân Thủy',
    type: 'building',
    lat: 21.036791579174974,
    lng: 105.7820570664141,
    description: 'Cổng chính vào trường từ đường Xuân Thủy',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    tags: ['Cổng', 'Lối vào'],
  },
  {
    id: 'CONG2',
    name: 'Cổng PVĐ',
    nameVi: 'Cổng PVĐ',
    type: 'building',
    lat: 21.03964484205782,
    lng: 105.78116818655224,
    description: 'Cổng phụ vào trường từ đường Phạm Văn Đồng',
    address: 'Phạm Văn Đồng, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Cổng', 'Lối vào'],
  },
  {
    id: 'CONGP',
    name: 'Cổng Phụ',
    nameVi: 'Cổng Phụ',
    type: 'building',
    lat: 21.040888033109084,
    lng: 105.78267112400499,
    description: 'Cổng phụ',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Cổng', 'Lối vào'],
  },
  {
    id: 'BAOVEPVĐ',
    name: 'Bảo vệ 2',
    nameVi: 'Bảo vệ 2',
    type: 'building',
    lat: 21.03938956724801,
    lng: 105.78121276017191,
    description: 'Trạm bảo vệ cổng Phạm Văn Đồng',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Bảo vệ', 'An ninh'],
  },
  {
    id: 'BAOVEXT',
    name: 'Bảo vệ 1',
    nameVi: 'Bảo vệ 1',
    type: 'building',
    lat: 21.03686313635906,
    lng: 105.78225545781584,
    description: 'Trạm bảo vệ cổng Xuân Thủy',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    tags: ['Bảo vệ', 'An ninh'],
  },

  // ========== NHÀ XE ==========
  {
    id: 'P_14a',
    name: 'Nhà xe 14a',
    nameVi: 'Nhà xe 14a',
    type: 'building',
    lat: 21.040230778034412,
    lng: 105.7825580783724,
    description: 'Nhà xe khu 14A',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    tags: ['Nhà xe', 'Đỗ xe'],
  },
  {
    id: 'P_14b',
    name: 'Nhà xe 14b',
    nameVi: 'Nhà xe 14b',
    type: 'building',
    lat: 21.039751005110787,
    lng: 105.78129100352783,
    description: 'Nhà xe khu 14B',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    tags: ['Nhà xe', 'Đỗ xe'],
  },
  {
    id: 'P_14c',
    name: 'Nhà xe 14c',
    nameVi: 'Nhà xe 14c',
    type: 'building',
    lat: 21.040858639860403,
    lng: 105.78277779365209,
    description: 'Nhà xe khu 14C',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    tags: ['Nhà xe', 'Đỗ xe'],
  },
  {
    id: 'P_C',
    name: 'Nhà xe khu C',
    nameVi: 'Nhà xe khu C',
    type: 'building',
    lat: 21.039486239165825,
    lng: 105.7817145800708,
    description: 'Nhà xe khu C',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    tags: ['Nhà xe', 'Đỗ xe'],
  },
  {
    id: 'P_E',
    name: 'Nhà xe khu E',
    nameVi: 'Nhà xe khu E',
    type: 'building',
    lat: 21.037745684639646,
    lng: 105.78264380795207,
    description: 'Nhà xe khu E',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    tags: ['Nhà xe', 'Đỗ xe'],
  },
  {
    id: 'P_Car',
    name: 'Bãi đỗ xe ô tô',
    nameVi: 'Bãi đỗ xe ô tô',
    type: 'building',
    lat: 21.03726473275222,
    lng: 105.78174321293005,
    description: 'Bãi đỗ xe ô tô',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
    tags: ['Đỗ xe', 'Ô tô'],
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
    descriptionEn: 'Famous coffee chain with spacious environment, perfect for group study',
    address: '130 Xuân Thủy, Cầu Giấy',
    addressEn: '130 Xuan Thuy, Cau Giay',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    isSponsored: true,
    hasVoucher: true,
    voucherText: 'Giảm 20% cho sinh viên',
    voucherTextKey: 'voucherDiscount20Student',
    rating: 4.3,
    reviewCount: 256,
    openHours: '07:00 - 22:30',
    phone: '024 3456 7890',
    reviews: [
      { author: 'Minh Anh', rating: 5, comment: 'Không gian đẹp, wifi mạnh!', commentEn: 'Beautiful space, strong wifi!', date: '2024-01-15' },
      { author: 'Hoàng Nam', rating: 4, comment: 'Cà phê ngon, giá hơi cao', commentEn: 'Good coffee, a bit pricey', date: '2024-01-10' },
    ],
    tags: ['Cà phê', 'Study space', 'Wifi'],
    tagsEn: ['Coffee', 'Study Space', 'WiFi'],
  },
  {
    id: 'the-coffee-house',
    name: 'The Coffee House',
    nameVi: 'The Coffee House',
    type: 'food',
    lat: 21.0395,
    lng: 105.7835,
    description: 'Quán cà phê yên tĩnh với menu đa dạng, có phòng riêng cho nhóm',
    descriptionEn: 'Quiet coffee shop with diverse menu, private rooms available for groups',
    address: '158 Xuân Thủy, Cầu Giấy',
    addressEn: '158 Xuan Thuy, Cau Giay',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
    isSponsored: true,
    hasVoucher: true,
    voucherText: 'Mua 2 tặng 1',
    voucherTextKey: 'voucherBuy2Get1',
    rating: 4.5,
    reviewCount: 189,
    openHours: '07:30 - 23:00',
    phone: '024 3456 7891',
    reviews: [
      { author: 'Thu Hà', rating: 5, comment: 'Bánh ngọt rất ngon!', commentEn: 'The pastries are delicious!', date: '2024-01-18' },
      { author: 'Văn Đức', rating: 4, comment: 'Phục vụ tốt, không gian ổn', commentEn: 'Good service, nice atmosphere', date: '2024-01-12' },
    ],
    tags: ['Cà phê', 'Bánh ngọt', 'Nhóm'],
    tagsEn: ['Coffee', 'Pastry', 'Group'],
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
    name: 'Student Housing',
    nameVi: 'Nhà trọ Sinh Viên Xuân Thủy',
    type: 'housing',
    lat: 21.0355,
    lng: 105.7850,
    description: 'Nhà trọ sạch sẽ, an ninh tốt, gần trường. Giá từ 1.5tr/tháng',
    descriptionEn: 'Clean housing with good security, near campus. From 1.5M VND/month',
    address: '170 Xuân Thủy, Cầu Giấy',
    addressEn: '170 Xuan Thuy, Cau Giay',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    isSponsored: true,
    hasVoucher: true,
    voucherText: 'Giảm 500k tháng đầu',
    voucherTextKey: 'voucherDiscount500kFirstMonth',
    rating: 4.1,
    reviewCount: 45,
    phone: '0912 345 678',
    tags: ['Nhà trọ', 'An ninh', 'Giá rẻ'],
    tagsEn: ['Housing', 'Safe', 'Budget-friendly'],
  },

  // ========== VIỆC LÀM ==========
  {
    id: 'job-1',
    name: 'Part-time Job',
    nameVi: 'Circle K - Tuyển Part-time',
    type: 'job',
    lat: 21.0372,
    lng: 105.7795,
    description: 'Circle K tuyển nhân viên part-time ca tối. Lương 25k/h + tips',
    descriptionEn: 'Circle K hiring part-time evening staff. 25k/h + tips',
    address: '120 Xuân Thủy, Cầu Giấy',
    addressEn: '120 Xuan Thuy, Cau Giay',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    openHours: 'Ca 18:00 - 23:00',
    openHoursEn: 'Shift 18:00 - 23:00',
    phone: '0987 654 321',
    tags: ['Part-time', 'Bán hàng', 'Tối'],
    tagsEn: ['Part-time', 'Sales', 'Evening'],
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
