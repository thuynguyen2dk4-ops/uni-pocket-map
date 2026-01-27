// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const CLIENT_ID = Deno.env.get("PAYOS_CLIENT_ID");
    const API_KEY = Deno.env.get("PAYOS_API_KEY");
    const CHECKSUM_KEY = Deno.env.get("PAYOS_CHECKSUM_KEY");
    
    // Kết nối Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { storeId, type, packageType, returnUrl, cancelUrl } = await req.json();
    if (!storeId) throw new Error("Thiếu Store ID");

    // Tạo mã đơn hàng
    const orderCode = Number(String(Date.now()).slice(-9)); 
    let amount = 2000;
    let description = "";

    // --- THUẬT TOÁN TÍNH TIỀN Ở ĐÂY ---
    
    if (type === "vip") {
      // VIP: 100k dùng mãi mãi
      amount = 100000; 
      description = `VIP ${orderCode}`;
    } 
    else if (type === "ad") {
      // Quảng cáo: Tùy theo gói tuần/tháng
      if (packageType === 'month') {
        amount = 150000; // Giá QC Tháng (30 ngày)
        description = `QC Thang ${orderCode}`;
      } else {
        amount = 50000;  // Giá QC Tuần (7 ngày)
        description = `QC Tuan ${orderCode}`;
      }
    }

    // --- CẬP NHẬT MÃ ĐƠN HÀNG VÀO DATABASE ---
    // Để lát nữa Webhook biết đơn hàng này mua gói gì
    const { error: updateError } = await supabase
      .from("user_stores")
      .update({ 
        last_order_code: orderCode,
        // Lưu tạm loại gói khách đang mua để Webhook xử lý ngày hết hạn
        pending_package_type: type === 'vip' ? 'vip_lifetime' : (packageType === 'month' ? 'ad_month' : 'ad_week')
      })
      .eq("id", storeId);

    if (updateError) console.error("Lỗi update orderCode:", updateError);

    // --- GỌI QUA PAYOS ---
    const signData = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
    const hmac = createHmac("sha256", CHECKSUM_KEY);
    hmac.update(signData);
    const signature = hmac.digest("hex");

    const payload = {
      orderCode, amount, description, 
      buyerName: "User", buyerEmail: "user@example.com",
      cancelUrl, returnUrl, signature,
      items: [{ name: description, quantity: 1, price: amount }]
    };

    const response = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-client-id": CLIENT_ID, "x-api-key": API_KEY },
        body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok || result.code !== "00") throw new Error(result.desc);

    return new Response(JSON.stringify({ checkoutUrl: result.data.checkoutUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});