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
# Khi chạy local dùng: http://localhost:8080
# Khi chạy thật dùng: [https://your-domain.com](https://your-domain.com)
VITE_APP_URL=http://localhost:8080


3. Bảo mật Thanh toán (Stripe & Supabase)

Đây là phần quan trọng nhất để đảm bảo tiền về tài khoản và dữ liệu an toàn.

Bước 1: Lấy API Key từ Stripe Dashboard

Truy cập Stripe Dashboard.

Bật công tắc Test Mode (góc trên bên phải) nếu bạn đang chạy thử nghiệm.

Vào menu Developers -> API keys.

Tại phần Secret keys, bấm "Reveal test key".

Copy đoạn mã bắt đầu bằng sk_test_... (hoặc sk_live_... nếu chạy thật).

Đây là chìa khóa két sắt, tuyệt đối không gửi qua chat hay để lộ.

Bước 2: Nhập Key vào Supabase

Truy cập Supabase Dashboard.

Chọn dự án của bạn.

Vào mục Edge Functions (biểu tượng tia sét ⚡ bên trái) -> Secrets (hoặc gõ lệnh CLI nếu bạn dùng terminal).

Bấm Add new secret và tạo:

Name: STRIPE_SECRET_KEY

Value: (Dán đoạn mã sk_... bạn vừa copy ở Bước 1).

Bước 3: Thiết lập Webhook (Để tự động xác nhận thanh toán)

Quay lại Stripe Dashboard -> Developers -> Webhooks.

Bấm Add endpoint.

Endpoint URL: Nhập đường dẫn Edge Function của bạn.

Công thức: https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook

(Thay <PROJECT_REF> bằng mã dự án Supabase của bạn).

Select events: Bấm nút này và tìm chọn sự kiện: checkout.session.completed.

Bấm Add endpoint.

Sau khi tạo xong, ở góc trên bên phải màn hình Webhook, tìm phần Signing secret, bấm "Reveal".

Copy đoạn mã bắt đầu bằng whsec_....

Bước 4: Nhập Webhook Secret vào Supabase

Quay lại Supabase Dashboard -> Edge Functions -> Secrets.

Bấm Add new secret và tạo:

Name: STRIPE_WEBHOOK_SIGNING_SECRET

Value: (Dán đoạn mã whsec_... bạn vừa copy ở Bước 3).

Tại sao quy trình này an toàn?

Client (React): Khi người dùng bấm "Thanh toán", nó chỉ gửi yêu cầu "Tôi muốn mua gói A" lên Server. Nó không hề chạm vào thông tin thẻ hay tài khoản Stripe.

Server (Supabase): Dùng STRIPE_SECRET_KEY (đã giấu kín ở Bước 2) để nói chuyện với Stripe và tạo ra một Link thanh toán an toàn.

Stripe: Xử lý toàn bộ việc nhập thẻ, xác thực ngân hàng (chuẩn PCI-DSS).

Xác nhận: Khi tiền đã trừ, Stripe dùng whsec_... (Bước 3) để gọi ngược lại Supabase báo tin, đảm bảo không ai giả mạo được kết quả thanh toán.

4. Bảo mật Dữ liệu (Row Level Security - RLS)

Trong Supabase, hãy đảm bảo bạn đã bật RLS cho các bảng quan trọng (như profiles, orders).

Ví dụ: Chỉ user chính chủ mới xem được lịch sử đơn hàng của mình.

Kiểm tra file migration SQL của bạn để chắc chắn có câu lệnh ALTER TABLE "tên_bảng" ENABLE ROW LEVEL SECURITY;.
