export const getMapboxToken = (): string | null => {
  // 1. Ưu tiên lấy từ biến môi trường (Cấu hình trên Vercel/File .env)
  const envToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
  if (envToken && envToken.length > 0) {
    return envToken;
  }

  // 2. Nếu không có, mới tìm trong LocalStorage (Do người dùng nhập tay)
  return localStorage.getItem('mapbox_token');
};

export const saveMapboxToken = (token: string) => {
  localStorage.setItem('mapbox_token', token);
};