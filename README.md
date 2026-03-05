# 🗺️ ThodiaUni - Bản Đồ & Tiện Ích Dành Cho Sinh Viên

**ThodiaUni** là nền tảng bản đồ số và khám phá địa điểm được thiết kế riêng cho sinh viên đại học. Ứng dụng giúp sinh viên dễ dàng tìm kiếm giảng đường, quán ăn ngon - bổ - rẻ, nhà trọ, việc làm thêm và các tiện ích thiết yếu xung quanh khu vực làng đại học.

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
* Tài khoản firebase, gcp, route53: contact@thodiauni.com, pass: Thodiauni123

### Các bước cài đặt
1. Deploy
   ```bash
   firebase login --reauth
   firebase deploy --only hosting
   ```
2.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```

3.  **Cấu hình biến môi trường:**
    Tạo file `.env` tại thư mục gốc và điền các thông tin sau:
    ```env
    VITE_FIREBASE_API_KEY=AIzaSyAJHXB1tqt3VtZZ1qrEQR0NpPDBEjId9tk
    VITE_FIREBASE_AUTH_DOMAIN=winged-ray-485505-m3.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=winged-ray-485505-m3
    VITE_FIREBASE_STORAGE_BUCKET=winged-ray-485505-m3.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=1067502227654
    VITE_FIREBASE_APP_ID=1:1067502227654:web:c784f33fc7d56a56f207c7
    VITE_MAPBOX_PUBLIC_TOKEN=pk.eyJ1IjoiYW5odGh1eTA0IiwiYSI6ImNta25kbnoweDBsYTkzZnNiMncxbnZscncifQ.3RK47LOR8WkYagYydkps1w

    VITE_API_URL=https://thodia-backend-1067502227654.asia-southeast1.run.app
    ```

4.  **Chạy ứng dụng (Development):**
    ```bash
    npm run dev
    ```
    Truy cập `http://localhost:8081` (hoặc port hiển thị trên terminal).

## 📄 Bản Quyền
Dự án thuộc về đội ngũ phát triển ThodiaUni.
