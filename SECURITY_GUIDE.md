Hướng dẫn Bảo mật & Cấu hình Môi trường (UniPocket)

Tài liệu này hướng dẫn cách cấu hình bảo mật cho 3 thành phần cốt lõi: Bản đồ, Tài khoản (Supabase), và Thanh toán (Stripe).

1. Nguyên tắc cốt lõi

KHÔNG BAO GIỜ commit file .env lên GitHub/GitLab.

Client-side (Code React): Chỉ chứa các key công khai (pk_..., anon_key).

Server-side (Supabase Edge Functions): Nơi duy nhất được chứa Secret Key (sk_..., service_role_key).

2. Cấu hình file .env (Ở thư mục gốc dự án)

Bạn cần tạo hoặc sửa file .env và điền đầy đủ các giá trị sau:

# --- 1. Mapbox (Bản đồ) ---
# Lấy tại: [https://account.mapbox.com/](https://account.mapbox.com/)
# Bảo mật: Cấu hình "URL Restriction" trên trang Mapbox chỉ cho phép domain của bạn.
VITE_MAPBOX_TOKEN=pk.eyJ1Ijo...

# --- 2. Supabase (Tài khoản & Database) ---
# Lấy tại: Supabase Dashboard -> Project Settings -> API
# Đây là các key AN TOÀN để lộ ở phía client (trình duyệt).
VITE_SUPABASE_URL=[https://xyz...supabase.co](https://xyz...supabase.co)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...

# --- 3. URL Ứng dụng ---
# Dùng để chuyển hướng sau khi thanh toán hoặc đăng nhập.
VITE_APP_URL=http://localhost:8080 (hoặc domain thật của bạn)


3. Bảo mật Thanh toán (Stripe)

LƯU Ý: Các cấu hình này KHÔNG để trong file .env ở Client. Bạn phải cài đặt chúng trong Supabase Dashboard (mục Edge Functions Secrets).

Truy cập: Supabase Dashboard -> Edge Functions -> Secrets (hoặc dùng CLI).

Thêm các secret sau:

Tên Secret

Giá trị lấy từ đâu?

Mục đích

STRIPE_SECRET_KEY

Stripe Dashboard -> Developers -> API Keys (sk_live_...)

Để tạo link thanh toán an toàn.

STRIPE_WEBHOOK_SIGNING_SECRET

Stripe Dashboard -> Developers -> Webhooks (whsec_...)

Để xác minh tiền đã thực sự về chưa.

Tại sao an toàn?

Hacker có thể xem code React, nhưng họ chỉ thấy create-checkout.

Code này gọi lên Server (Supabase Edge Function).

Chỉ có Server mới nắm STRIPE_SECRET_KEY để nói chuyện với Stripe.

Kết luận: Tiền và thông tin thẻ không bao giờ đi qua code React của bạn trực tiếp, đảm bảo chuẩn PCI-DSS.

4. Bảo mật Dữ liệu (Row Level Security - RLS)

Trong Supabase, hãy đảm bảo bạn đã bật RLS cho các bảng quan trọng (như profiles, orders).

Ví dụ: Chỉ user chính chủ mới xem được lịch sử đơn hàng của mình.

Kiểm tra file migration SQL của bạn để chắc chắn có câu lệnh ALTER TABLE "tên_bảng" ENABLE ROW LEVEL SECURITY;.
