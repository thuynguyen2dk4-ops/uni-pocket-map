export const getMapboxToken = () => {
  // --- CẬP NHẬT BẢO MẬT ---
  // Thay vì dán token trực tiếp ở đây (không an toàn), 
  // chúng ta sẽ lấy từ file cấu hình môi trường (.env).
  
  // Ưu tiên 1: Lấy từ biến môi trường (Cách chuẩn và bảo mật nhất)
  const envToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // Ưu tiên 2: Lấy từ localStorage (Chỉ dùng khi bạn đang test hoặc nhập tay tạm thời)
  const localToken = localStorage.getItem("mapbox_token");

  // Logic:
  // - Nếu bạn đã cấu hình file .env đúng, 'envToken' sẽ có giá trị và web chạy luôn.
  // - Nếu chưa cấu hình, nó sẽ trả về rỗng và hiện bảng nhập token.
  return envToken || localToken || "";
};

export const setMapboxToken = (token: string) => {
  localStorage.setItem("mapbox_token", token);
};
