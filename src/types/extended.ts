export interface MenuItem {
  name: string;
  price: number;
}

export interface Voucher {
  code: string;
  desc: string;
}

export interface ExtendedLocation {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  description?: string;
  image?: string;
  type?: 'free' | 'premium';
  rating?: number;
  reviews?: number;
  menu?: MenuItem[];
  vouchers?: Voucher[];
}

export const CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: 'MapPin' },
  { id: 'food', label: 'Ăn uống', icon: 'Utensils' },
  { id: 'coffee', label: 'Cà phê', icon: 'Coffee' },
  { id: 'study', label: 'Học tập', icon: 'BookOpen' },
  { id: 'entertainment', label: 'Vui chơi', icon: 'Gamepad2' },
];
