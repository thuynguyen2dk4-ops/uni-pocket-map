# 🗺️ ThodiaUni - Bản Đồ & Tiện Ích Dành Cho Sinh Viên

**ThodiaUni** là nền tảng bản đồ số và khám phá địa điểm được thiết kế riêng cho sinh viên đại học. Ứng dụng giúp sinh viên dễ dàng tìm kiếm giảng đường, quán ăn ngon - bổ - rẻ, nhà trọ, việc làm thêm và các tiện ích thiết yếu xung quanh khu vực làng đại học.

![ThodiaUni Banner](https://placehold.co/1200x400?text=ThodiaUni+App+Screenshot)

## 🌟 Tính Năng Nổi Bật

* **📍 Bản Đồ Thông Minh:** Tích hợp Mapbox với giao diện trực quan, hiển thị các địa điểm quan trọng (Giảng đường, ATM, Cây xăng, Trạm sạc xe điện...).
* **🔍 Tìm Kiếm Thông Minh (AI-based):**
    * Hiểu ý định người dùng (Ví dụ: Gõ "đói" -> Gợi ý quán ăn, gõ "hết tiền" -> Gợi ý ATM).
    * Hỗ trợ tìm kiếm địa điểm ngoại vi (Landmark 72, Marriott...) kết hợp dữ liệu nội bộ.
* **⭐ Đánh Giá & Review:** Hệ thống đánh giá địa điểm minh bạch từ cộng đồng sinh viên.
* **🎁 Săn Voucher:** Tính năng lưu và sử dụng mã giảm giá độc quyền từ các cửa hàng liên kết.
* **🛣️ Chỉ Đường:** Tích hợp định vị và dẫn đường tối ưu cho người đi bộ và xe máy.
* **💼 Dành Cho Chủ Cửa Hàng:** Tính năng "Xác nhận chủ sở hữu" (Claim Store) để quản lý thông tin, menu và khuyến mãi.

## 🛠️ Công Nghệ Sử Dụng

Dự án được xây dựng dựa trên các công nghệ hiện đại:

* **Frontend:** [React](https://reactjs.org/) (Vite), [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
* **Map Provider:** [Mapbox GL JS](https://www.mapbox.com/)
* **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Icons:** Lucide React
* **Animations:** Framer Motion

## 🚀 Cài Đặt & Chạy Dự Án

### Yêu cầu
* Node.js (v16 trở lên)
* Tài khoản Mapbox (để lấy Access Token)
* Tài khoản Supabase

### Các bước cài đặt

1.  **Clone repository:**
    ```bash
    git clone [https://github.com/username/thodiauni.git](https://github.com/username/thodiauni.git)
    cd thodiauni
    ```

2.  **Cài đặt dependencies:**
    ```bash
    npm install
    # hoặc
    yarn install
    ```

3.  **Cấu hình biến môi trường:**
    Tạo file `.env` tại thư mục gốc và điền các thông tin sau:
    ```env
    VITE_MAPBOX_TOKEN=pk.eyJ... (Token Mapbox của bạn)
    VITE_SUPABASE_URL=https://...
    VITE_SUPABASE_ANON_KEY=...
    ```

4.  **Chạy ứng dụng (Development):**
    ```bash
    npm run dev
    ```
    Truy cập `http://localhost:8080` (hoặc port hiển thị trên terminal).

## 🤝 Đóng Góp
Mọi đóng góp đều được hoan nghênh! Vui lòng tạo Pull Request hoặc mở Issue nếu bạn phát hiện lỗi.

## 📄 Bản Quyền
Dự án thuộc về đội ngũ phát triển ThodiaUni.