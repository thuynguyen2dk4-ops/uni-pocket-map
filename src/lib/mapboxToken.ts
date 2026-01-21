export const getMapboxToken = () => {
  // --- CẤU HÌNH TOKEN MẶC ĐỊNH ---
  // Bạn hãy dán Mapbox Public Token của bạn vào trong dấu ngoặc kép dưới đây.
  // Ví dụ: "pk.eyJ1Ijo..."
  const DEFAULT_TOKEN = "pk.eyJ1IjoiYW5odGh1eTA0IiwiYSI6ImNta2g1ZGxyOTBheHUzZXEwa2loY25jMWcifQ.tOQp9wrfN4WodT0iPlkaUg"; 
  
  // Logic hoạt động:
  // 1. Kiểm tra xem người dùng có nhập tay token nào chưa (trong localStorage).
  // 2. Nếu không, kiểm tra biến môi trường (VITE_MAPBOX_TOKEN).
  // 3. Nếu không, sử dụng DEFAULT_TOKEN bạn vừa điền ở trên.
  // 4. Nếu vẫn không có, trả về chuỗi rỗng "" (lúc này bảng nhập token mới hiện ra).
  return localStorage.getItem("mapbox_token") || import.meta.env.VITE_MAPBOX_TOKEN || DEFAULT_TOKEN;
};

export const setMapboxToken = (token: string) => {
  localStorage.setItem("mapbox_token", token);
};
