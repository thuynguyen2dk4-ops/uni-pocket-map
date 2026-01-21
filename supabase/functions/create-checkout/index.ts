import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import PayOS from 'npm:@payos/node';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Xử lý CORS cho trình duyệt
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Khởi tạo PayOS từ biến môi trường
    const clientId = Deno.env.get('PAYOS_CLIENT_ID');
    const apiKey = Deno.env.get('PAYOS_API_KEY');
    const checksumKey = Deno.env.get('PAYOS_CHECKSUM_KEY');

    if (!clientId || !apiKey || !checksumKey) {
      throw new Error("Thiếu cấu hình PAYOS trong Supabase Secrets");
    }

    const payOS = new PayOS(clientId, apiKey, checksumKey);

    // 2. Lấy dữ liệu từ Client gửi lên
    const { priceId, successUrl, cancelUrl } = await req.json();

    console.log("Creating payment link for:", priceId);

    // 3. Xác định số tiền (Trong thực tế bạn nên lấy từ Database dựa vào priceId)
    // Demo: price_1 = 20.000 VNĐ, price_2 = 50.000 VNĐ
    let amount = 10000; // Mặc định
    let description = "Thanh toan UniPocket";

    if (priceId === 'price_premium_month') {
        amount = 50000;
        description = "Goi Premium 1 Thang";
    } else if (priceId === 'price_premium_year') {
        amount = 500000;
        description = "Goi Premium 1 Nam";
    }

    // 4. Tạo mã đơn hàng (Bắt buộc là số nguyên, ví dụ dùng timestamp)
    // Lưu ý: Giới hạn của PayOS orderCode là số int32
    const orderCode = Number(String(Date.now()).slice(-6));

    const body = {
      orderCode: orderCode,
      amount: amount,
      description: description,
      items: [
        {
          name: description,
          quantity: 1,
          price: amount
        }
      ],
      returnUrl: successUrl ?? 'http://localhost:8080/admin', 
      cancelUrl: cancelUrl ?? 'http://localhost:8080/admin',
    };

    // 5. Gọi PayOS để lấy Link QR
    const paymentLink = await payOS.createPaymentLink(body);

    // 6. Trả về URL cho React Frontend chuyển hướng
    return new Response(
      JSON.stringify({ url: paymentLink.checkoutUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Lỗi tạo thanh toán:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
