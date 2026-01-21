import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import PayOS from 'npm:@payos/node';

// Khởi tạo Client PayOS (cần để xác thực webhook)
const payOS = new PayOS(
  Deno.env.get('PAYOS_CLIENT_ID') ?? '',
  Deno.env.get('PAYOS_API_KEY') ?? '',
  Deno.env.get('PAYOS_CHECKSUM_KEY') ?? ''
);

serve(async (req) => {
  try {
    const body = await req.json();
    
    // 1. Xác thực Webhook (Đảm bảo tin nhắn này đến từ PayOS thật)
    // PayOS cung cấp hàm verifyPaymentWebhookData
    const webhookData = payOS.verifyPaymentWebhookData(body);

    console.log("Nhận thanh toán thành công:", webhookData);
    
    // webhookData chứa: { orderCode, amount, ... }

    // 2. TODO: Cập nhật Database Supabase
    // Tại đây bạn sẽ viết code cập nhật trạng thái user thành "Premium"
    // Ví dụ: Tìm trong bảng 'orders' xem orderCode này của user nào.
    
    /* const { error } = await supabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', userId); 
    */

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Lỗi Webhook:", error);
    return new Response(
      JSON.stringify({ error: "Invalid Webhook Data" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
